import { IonPage, IonContent, IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";
import { useIonRouter } from "@ionic/react";
import { supabase } from "../utils/supabaseClients";

const AuthCallback: React.FC = () => {
  const router = useIonRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      //console.log('Auth state:', user); // Debug log

      if (!user) {
        router.push("/", "root", "replace");
        return;
      }

      // Check if user already exists
      const { data: existingAccount, error: fetchError } = await supabase
        .from("users")
        .select("role, auth_id, active, privacy_agreement")
        .eq("email", user.email)
        .maybeSingle();

      if (fetchError) {
        console.error("Fetch error:", fetchError.message);
        router.push("/", "root", "replace");
        return;
      }

      // If account exists but auth_id is not set, update it
      if (existingAccount && !existingAccount.auth_id) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ auth_id: user.id })
          .eq("email", user.email);

        if (updateError) {
          console.error("Update error:", updateError.message);
          router.push("/", "root", "replace");
          return;
        }
      }

      // Check if existing account is deactivated
      if (existingAccount && existingAccount.active === false) {
        setErrorMessage("Your account has been deactivated. Please contact an administrator.");
        
        await supabase.auth.signOut();
        
        setTimeout(() => {
          router.push("/", "root", "replace");
        }, 3000);
        return;
      }

      let userRole = existingAccount?.role;

      // Insert only if new (new users are active by default with 'user' role)
      if (!existingAccount) {
        const newUserData = {
          username:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "New User",
          email: user.email,
          role: "teenager", 
          auth_id: user.id,
          active: true, 
          privacy_agreement: true,
          privacy_agreed_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase.from("users").insert([newUserData]);

        if (insertError) {
          console.error("Insert error:", insertError.message);
          router.push("/", "root", "replace");
          return;
        }

        userRole = "teenager"; 
      } else {
        
        if (!existingAccount.privacy_agreement) {
          const { error: updatePrivacyError } = await supabase
            .from("users")
            .update({ 
              privacy_agreement: true,
              privacy_agreed_at: new Date().toISOString()
            })
            .eq("email", user.email);

          if (updatePrivacyError) {
            console.error("Privacy update error:", updatePrivacyError.message);
          }
        }
      }

      
      const adminRoles = ['admin', 'healthworker', 'socialworker', 'school'];
      const userRoles = [ 'teenager']; 

      if (adminRoles.includes(userRole)) {
        
        router.push("/admin", "root", "replace");
      } else if (userRoles.includes(userRole)) {
        
        router.push("/home", "root", "replace");
      } else {
        
        if (userRole === 'teenager') {
          router.push("/home", "root", "replace");
        } else {
          router.push("/admin", "root", "replace");
        }
      }
    };

    handleOAuth();
  }, [router]);

  return (
    <IonPage>
      <IonContent
        className="ion-text-center ion-padding"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        {errorMessage ? (
          <div style={{ 
            color: '#d32f2f', 
            fontSize: '18px', 
            fontWeight: 'bold',
            padding: '20px',
            textAlign: 'center'
          }}>
            {errorMessage}
            <p style={{ fontSize: '14px', marginTop: '10px' }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            <IonSpinner name="crescent" />
            <p>Signing in...</p>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AuthCallback;