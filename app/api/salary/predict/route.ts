import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { callGroq, callGemini } from '@/lib/llm';

const predictSchema = z.object({
  ctc: z.number(),
  role: z.string(),
  city: z.string(),
  expYears: z.number(),
  skills: z.array(z.string()),
  resumeFileId: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinText: z.string().optional(),
});

const GROQ_SYSTEM_PROMPT = `You are a compensation coach for Indian tech roles. 
Given numeric predictions, output four actionable bullets with skill upgrades and time estimates.
Format as JSON array: [{"skill": string, "action": string, "timeframe": string, "impact": string}]`;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = predictSchema.parse(body);

    // Merge skills from all sources
    let allSkills = [...input.skills];

    // Parse resume if provided
    if (input.resumeFileId) {
      try {
        const { data: fileData } = await supabase.storage
          .from('vault')
          .download(`${user.id}/${input.resumeFileId}`);
        
        if (fileData) {
          const resumeText = await callGemini(
            'Extract skills as JSON array from this resume text. Return only: {"skills": string[]}',
            { file: 'PDF content' }
          );
          const parsed = JSON.parse(resumeText);
          allSkills.push(...(parsed.skills || []));
        }
      } catch (e) {
        console.error('Resume parse error:', e);
      }
    }

    // Fetch GitHub repos if URL provided
    if (input.githubUrl) {
      try {
        const username = input.githubUrl.split('github.com/')[1]?.split('/')[0];
        if (username) {
          const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
          if (response.ok) {
            const repos = await response.json();
            const languages = new Set<string>();
            repos.forEach((r: any) => {
              if (r.language) languages.add(r.language);
              (r.topics || []).forEach((t: string) => languages.add(t));
            });
            allSkills.push(...Array.from(languages));
          }
        }
      } catch (e) {
        console.error('GitHub fetch error:', e);
      }
    }

    // Add LinkedIn skills if provided
    if (input.linkedinText) {
      try {
        const linkedinSkills = await callGemini(
          'Extract technical skills from LinkedIn profile text. Return JSON: {"skills": string[]}',
          { text: input.linkedinText }
        );
        const parsed = JSON.parse(linkedinSkills);
        allSkills.push(...(parsed.skills || []));
      } catch (e) {
        console.error('LinkedIn parse error:', e);
      }
    }

    // Deduplicate skills
    allSkills = Array.from(new Set(allSkills.map(s => s.toLowerCase()))).slice(0, 20);

    // Calculate predictions
    const predictions = calculateSalaryPrediction({
      role: input.role,
      city: input.city,
      expYears: input.expYears,
      currentCTC: input.ctc,
      skills: allSkills,
    });

    // Get AI recommendations
    const recommendationsText = await callGroq(
      'llama-3.1-70b',
      GROQ_SYSTEM_PROMPT,
      `Current: ${input.ctc} INR, Role: ${input.role}, Exp: ${input.expYears}y, Skills: ${allSkills.join(', ')}. 
      Predictions: 1Y: ${predictions.oneYear.mid} INR, 3Y: ${predictions.threeYear.mid} INR.
      Provide 4 specific skill upgrade recommendations.`
    );

    let recommendations = [];
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch {
      // Fallback if not valid JSON
      recommendations = [
        {
          skill: 'Cloud Computing',
          action: 'Get AWS/Azure certification',
          timeframe: '3-6 months',
          impact: '+8-12% salary boost',
        },
        {
          skill: 'AI/ML',
          action: 'Complete GenAI specialization',
          timeframe: '4-8 months',
          impact: '+10-15% salary boost',
        },
        {
          skill: 'System Design',
          action: 'Master distributed systems',
          timeframe: '6-12 months',
          impact: '+15-20% for senior roles',
        },
        {
          skill: 'Leadership',
          action: 'Lead 2-3 projects, mentor juniors',
          timeframe: '6-12 months',
          impact: 'Enable promotion to next level',
        },
      ];
    }

    // Save to salary history
    await supabase.from('salary_history').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      base_ctc: input.ctc,
      title: input.role,
      skills: allSkills,
      city: input.city,
    });

    // Save insights
    await supabase.from('insights').insert({
      user_id: user.id,
      kind: 'salary_advice',
      content: { predictions, recommendations },
    });

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        recommendations,
        factors: predictions.factors,
        skillsDetected: allSkills,
        band: [predictions.oneYear.low, predictions.oneYear.mid, predictions.oneYear.high],
        planBullets: recommendations.map((r: any) => `${r.skill}: ${r.action} (${r.timeframe}) - ${r.impact}`),
      },
    });
  } catch (error) {
    console.error('Salary prediction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to predict salary' },
      { status: 500 }
    );
  }
}

function calculateSalaryPrediction(data: {
  role: string;
  city: string;
  expYears: number;
  currentCTC: number;
  skills: string[];
}) {
  const { role, expYears, currentCTC, skills } = data;

  // Base CAGR
  let baseCAGR = 0.07; // 7%

  // Skill multipliers
  const skillBoosts: Record<string, number> = {
    genai: 0.06,
    ai: 0.06,
    ml: 0.05,
    'machine learning': 0.05,
    cloud: 0.04,
    aws: 0.04,
    azure: 0.04,
    gcp: 0.04,
    'data engineering': 0.03,
    security: 0.04,
    cybersecurity: 0.04,
    devops: 0.03,
    kubernetes: 0.03,
    react: 0.02,
    angular: 0.02,
    vue: 0.02,
    node: 0.02,
    python: 0.02,
    java: 0.02,
  };

  let skillMultiplier = 0;
  skills.forEach((skill) => {
    const normalizedSkill = skill.toLowerCase();
    Object.entries(skillBoosts).forEach(([key, boost]) => {
      if (normalizedSkill.includes(key)) {
        skillMultiplier += boost;
      }
    });
  });

  // Role multipliers
  const roleLower = role.toLowerCase();
  let roleMultiplier = 1.0;
  if (roleLower.includes('intern')) roleMultiplier = 0.8;
  else if (roleLower.includes('junior') || roleLower.includes('associate'))
    roleMultiplier = 0.95;
  else if (roleLower.includes('senior') || roleLower.includes('sr'))
    roleMultiplier = 1.15;
  else if (
    roleLower.includes('lead') ||
    roleLower.includes('principal') ||
    roleLower.includes('staff')
  )
    roleMultiplier = 1.25;
  else if (
    roleLower.includes('architect') ||
    roleLower.includes('manager') ||
    roleLower.includes('director')
  )
    roleMultiplier = 1.3;

  // Clamp experience
  const clampedExp = Math.max(0, Math.min(30, expYears));

  // Adjust CAGR based on experience (higher early career growth)
  if (clampedExp < 3) baseCAGR += 0.03;
  else if (clampedExp < 5) baseCAGR += 0.02;
  else if (clampedExp > 10) baseCAGR -= 0.01;

  // Final growth rate
  const growthRate = (baseCAGR + skillMultiplier) * roleMultiplier;

  // 1-year prediction
  const oneYearMid = Math.round(currentCTC * (1 + growthRate));
  const oneYearLow = Math.round(oneYearMid * 0.85);
  const oneYearHigh = Math.round(oneYearMid * 1.15);

  // 3-year prediction (compounded)
  const threeYearMid = Math.round(currentCTC * Math.pow(1 + growthRate, 3));
  const threeYearLow = Math.round(threeYearMid * 0.8);
  const threeYearHigh = Math.round(threeYearMid * 1.2);

  return {
    oneYear: { low: oneYearLow, mid: oneYearMid, high: oneYearHigh },
    threeYear: { low: threeYearLow, mid: threeYearMid, high: threeYearHigh },
    factors: {
      baseCAGR: `${(baseCAGR * 100).toFixed(1)}%`,
      skillBoost: `+${(skillMultiplier * 100).toFixed(1)}%`,
      roleMultiplier: `${roleMultiplier.toFixed(2)}x`,
      totalGrowth: `${(growthRate * 100).toFixed(1)}%`,
    },
  };
}
