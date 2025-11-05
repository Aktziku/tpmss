import { supabase } from '../utils/supabaseClients';

interface ProfileData {
  // Basic info
  profileid: number;
  firstName: string;  
  lastName: string;   
  birthdate: string;
  age: number;
  contactnum: string;
  marital_status: string;
  living_with: string;
  family_income: string;
  current_year_level: string;
  highest_educational_attainment: string;
  religion: string;
  fathers_occupation: string;
  mothers_occupation: string;

  // Address info
  barangay: string;
  municipality: string;
  province: string;
  zipcode: string;
}

interface PartnersData {
  partnerid: number;
  profileid: number;
  pFirstname: string;
  pLastname: string;
  pAge: number;
  pBirthdate: string;
  pOccupation: string;
  pIncome: string;
}

interface MaternalHealthData {
    health_id: number;
    profileid: number;
    pregnancy_status: string;
    medical_history: string;
    types_of_support: string;
    stage_of_pregnancy?: string; 
}

export async function saveCompleteProfile(
  profileData: ProfileData,
  maternalHealthData: MaternalHealthData,
  partnersPayload: PartnersData
) {
  try {
    
    //Insert into profile table
    const { data: profileResult, error: profileError } = await supabase
      .from('profile')
      .insert([profileData])
      .select('profileid');

    if (profileError) throw profileError;

    const profileid = profileResult[0].profileid;

    //Insert into maternalhealthRecord table
    const { data: healthResult, error: healthError } = await supabase
      .from('maternalhealthRecord')
      .insert([{...maternalHealthData, profileid}]);

    if (healthError) {
      // Rollback previous insertions
      await supabase
        .from('profile')
        .delete()
        .match({ profileid: profileid });
      await supabase
        .from('profile')
        .delete()
        .match({ profileid: profileid });
      throw healthError;
    }

    //Insert into partners table
    const {data: partnersResult, error: partnersError} = await supabase
      .from('partnersInfo')
      .insert([{...partnersPayload, profileid}]);

      if (partnersError) {
        // Rollback previous insertions
        await supabase
          .from('maternalhealthRecord')
          .delete()
          .match({ health_id: maternalHealthData.health_id });
          throw partnersError;
      }
    return { success: true, message: "Profile information successfully saved" };
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return { 
      success: false, 
      message: "Failed to save profile information", 
      error: error.message 
    };
  }
}

