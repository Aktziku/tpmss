import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClients';
import * as bcrypt from 'bcryptjs'
interface AddUserModalProps {
    isOpen: boolean;
    onClose:() => void;
    onSave: (users:any) => Promise<void>;
}
const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const[UserData,setUserData] = useState<any>({
        username: '',
        userfirstName: '',
        userlastName: '',
        email: '',
        role: '',
        password: ''
    });

    const handleChange = (key: string, value: any) => {
        setUserData({...UserData, [key]: value});
    };

    const handleSave =async () => {
        setLoading(true);
        setError(null);

        try {

            if (!UserData.username || !UserData.userfirstName || !UserData.userlastName || !UserData.email || !UserData.role) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            const {data: authData, error: authError} = await supabase.auth.signUp({
                email: UserData.email,
                password: UserData.password,
            });

            if (authError) {
                console.error('Supabase auth error:', authError.message);
                setError(authError.message);
                setLoading(false);
                return;
            }

            const auth_id = authData.user?.id;
            console.log("Created auth user with ID:", auth_id);

            if (!auth_id) {
                setError(' Please verify your email and try again.');
                setLoading(false);
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(UserData.password, salt);

            const {data, error} = await supabase
                .from('users')
                .insert([{
                    auth_id: auth_id,
                    username: UserData.username,
                    email: UserData.email,
                    userfirstName: UserData.userfirstName,
                    userlastName: UserData.userlastName,
                    role: UserData.role,
                    password: hashedPassword,
                }])
                .select();

                if (error) {
                    console.error('Supabase insert error:', error.message);
                    setError(error.message);
                }
                if (data) {
                   //console.log("Role being inserted:", UserData.role);
                    //console.log("Inserted user:", data);//debugger
                    await onSave(data[0]);
                    
                    setUserData({
                        username: '',
                        userfirstName: '',
                        userlastName: '',
                        email: '',
                        role: '',
                        password: ''
                    });
                    onClose();
                }
        } catch (error: any) {
            setError('An unexpected error occurred: ' + error.message);
        }
    };
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{'--width':'100%','--height':'100%',}}>
            <IonHeader>
                <IonToolbar 
                    style={{
                        '--background': '#002d54',
                        color: '#ffffff',
                    }}
                >
                    <IonTitle>Add New User</IonTitle>

                    {/* Close button */}
                    <IonButton
                        slot="end" 
                        onClick={onClose}
                        style={{
                            '--background': '#fff',
                            '--color': '#000000ff',
                            borderRadius: '8px',
                            marginRight: '10px',
                            fontWeight: 'bold',
                        }}
                    >
                        Close
                        </IonButton>
                </IonToolbar>
            </IonHeader>

                <IonContent className="ion-padding" style={{ "--background": "#fff" }}>
                        <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#ffffff" }}>
                            <IonCardContent>
                                <IonItem style={{ "--background": "#fff" }}>
                                    <IonLabel position="stacked" style={{'--color' : '#000000'}}>First Name<IonText color="danger"> *</IonText></IonLabel>
                                    <IonInput 
                                        value={UserData.userfirstName}
                                        onIonChange={(e) => handleChange("userfirstName", e.detail.value!)}
                                        style={{'--color' : '#000000'}}
                                        />
                                </IonItem>
                                <IonItem style={{ "--background": "#fff" }}>
                                    <IonLabel position="stacked" style={{'--color' : '#000000'}}>Last Name<IonText color="danger"> *</IonText></IonLabel>
                                    <IonInput 
                                        value={UserData.userlastName} 
                                        onIonChange={(e) => handleChange("userlastName", e.detail.value!)}
                                        style={{'--color' : '#000000'}}
                                        />
                                </IonItem>
                                <IonItem style={{ "--background": "#fff" }}>
                                 <IonLabel position="stacked" style={{'--color' : '#000000'}}>User Name<IonText color="danger"> *</IonText></IonLabel>
                                    <IonInput 
                                        value={UserData.username} 
                                        onIonChange={(e) => handleChange("username", e.detail.value!)} 
                                        style={{'--color' : '#000000'}}
                                        />
                                </IonItem>
                                <IonItem style={{ "--background": "#fff" }}>
                                    <IonLabel position="stacked" style={{'--color' : '#000000'}}>Email<IonText color="danger"> *</IonText></IonLabel>
                                    <IonInput type="email" value={UserData.email} onIonChange={(e) => handleChange("email", e.detail.value!)} style={{'--color' : '#000000'}} />
                                </IonItem>
                                <IonItem style={{ "--background": "#fff" }}>
                                    <IonLabel position="stacked" style={{'--color' : '#000000'}}>Password<IonText color="danger"> *</IonText></IonLabel>
                                    <IonInput type="password" value={UserData.password} onIonChange={(e) => handleChange("password", e.detail.value!)} style={{'--color' : '#000000'}} />
                                </IonItem>
                                <IonItem style={{'--background' : '#fff', '--color':'#000000', '--background-hover':'transparent',}}>
                                    <IonLabel position="stacked" style={{'--color' : '#000000'}}>Role<IonText color="danger"> *</IonText></IonLabel>
                                    <IonSelect value={UserData.role} onIonChange={(e) => handleChange("role", e.detail.value!)} style={{'--color' : '#000000'}}>
                                        <IonSelectOption value="admin">Admin</IonSelectOption>
                                        <IonSelectOption value="healthworker">Health Worker</IonSelectOption>
                                        <IonSelectOption value="socialworker">Social Worker</IonSelectOption>
                                        <IonSelectOption value="school">School Worker</IonSelectOption>
                                        <IonSelectOption value="user">User</IonSelectOption>
                                    </IonSelect>
                            </IonItem>

                                <IonRow className="ion-justify-content-center ion-margin-top">
                                    <IonCol size="auto">
                                    <IonButton 
                                        onClick = {handleSave}
                                        disabled = {loading}
                                        style={{
                                            '--background': '#002d54',
                                            color: 'white',
                                        }}
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </IonButton>
                                    </IonCol>
                                    <IonCol size="auto">
                                        <IonButton color="medium" fill="outline" onClick={onClose} disabled={loading}>
                                            Cancel
                                        </IonButton>
                                    </IonCol>
                                </IonRow>
                            </IonCardContent>
                        </IonCard>
                </IonContent>
            
        </IonModal>
    );
};

export default AddUserModal;