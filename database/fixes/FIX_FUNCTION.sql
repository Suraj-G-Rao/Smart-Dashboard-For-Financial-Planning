-- FIX THE LOAN CONTRIBUTION PROCESSING FUNCTION
-- Run this in Supabase SQL Editor to fix the function

CREATE OR REPLACE FUNCTION public.process_income_contributions(p_income_id UUID)
RETURNS VOID AS $$
DECLARE
    income_rec RECORD;
    emergency_fund_rec RECORD;
    loan_rec RECORD;
    remaining_loan_contribution DECIMAL(15,2);
BEGIN
    -- Get income details
    SELECT * INTO income_rec FROM public.income WHERE id = p_income_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Income record not found';
    END IF;
    
    -- Process emergency fund contribution
    IF income_rec.emergency_fund_contribution > 0 THEN
        SELECT * INTO emergency_fund_rec 
        FROM public.emergency_fund 
        WHERE user_id = income_rec.user_id;
        
        IF FOUND THEN
            -- Update emergency fund balance
            UPDATE public.emergency_fund 
            SET current_balance = current_balance + income_rec.emergency_fund_contribution,
                updated_at = NOW()
            WHERE id = emergency_fund_rec.id;
            
            -- Insert transaction record
            INSERT INTO public.emergency_fund_transactions (
                user_id, emergency_fund_id, amount, transaction_type, 
                date, description, source
            ) VALUES (
                income_rec.user_id, emergency_fund_rec.id, 
                income_rec.emergency_fund_contribution, 'deposit',
                income_rec.date, 'Automatic contribution from income', 'income_contribution'
            );
        END IF;
    END IF;
    
    -- Process loan contribution with FIXED LOGIC
    IF income_rec.loan_contribution > 0 THEN
        remaining_loan_contribution := income_rec.loan_contribution;
        
        -- Find the highest priority loan (highest interest rate first)
        SELECT * INTO loan_rec
        FROM public.loans 
        WHERE user_id = income_rec.user_id 
        AND status = 'active'
        AND outstanding_amount > 0
        ORDER BY interest_rate DESC, next_payment_date ASC
        LIMIT 1;
        
        IF FOUND THEN
            DECLARE
                payment_amount DECIMAL(15,2);
                excess_amount DECIMAL(15,2);
                monthly_rate DECIMAL(10,6);
                interest_component DECIMAL(15,2);
                principal_component DECIMAL(15,2);
            BEGIN
                -- Calculate excess amount
                IF remaining_loan_contribution >= loan_rec.monthly_emi THEN
                    payment_amount := loan_rec.monthly_emi;
                    excess_amount := remaining_loan_contribution - loan_rec.monthly_emi;
                    
                    -- CRITICAL: Add excess to loan savings
                    UPDATE public.loans 
                    SET excess_savings = COALESCE(excess_savings, 0) + excess_amount,
                        updated_at = NOW()
                    WHERE id = loan_rec.id;
                    
                    -- Return excess to account
                    IF loan_rec.account_id IS NOT NULL THEN
                        PERFORM public.update_account_balance(loan_rec.account_id, excess_amount);
                    ELSE
                        PERFORM public.update_account_balance(income_rec.account_id, excess_amount);
                    END IF;
                    
                    RAISE NOTICE 'Added excess savings: % to loan: %', excess_amount, loan_rec.loan_name;
                ELSE
                    payment_amount := remaining_loan_contribution;
                    excess_amount := 0;
                END IF;
                
                -- Calculate interest and principal components
                monthly_rate := loan_rec.interest_rate / 12.0 / 100.0;
                interest_component := loan_rec.outstanding_amount * monthly_rate;
                principal_component := GREATEST(0, payment_amount - interest_component);
                
                -- Insert loan payment record
                INSERT INTO public.loan_payments (
                    loan_id, payment_amount, principal_amount, interest_amount,
                    payment_date, due_date, status
                ) VALUES (
                    loan_rec.id, payment_amount, principal_component, 
                    LEAST(interest_component, payment_amount),
                    income_rec.date, loan_rec.next_payment_date, 'paid'
                );
                
                RAISE NOTICE 'Processed loan payment: % for loan: %', payment_amount, loan_rec.loan_name;
            END;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
