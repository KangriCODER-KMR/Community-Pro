/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://tyscjmspqqprhlcwwccv.supabase.co';
// Note: This is the publishable anonymous API key provided directly by the user to connect to their sandbox.
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_KEY || 'sb_publishable_LcZhJhGjQl2TdkWM-HOqIA_ze_oatJq';

export const supabase = createClient(supabaseUrl, supabaseKey);
