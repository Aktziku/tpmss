import { 
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, 
    IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonMenu, IonMenuButton, 
    IonPage, IonRefresher, IonRefresherContent, IonRow, IonText, IonTitle, IonToast, 
    IonToolbar, RefresherEventDetail, useIonRouter 
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClients';
import { calendarOutline, timeOutline, logOutOutline, personCircleOutline, saveOutline } from 'ionicons/icons';

interface VisitSchedule {
    visitid: number;
    prenatal_visit_num: number;
    prenatal_next_sched: string;
    postnatal_visit_num: number;
    postnatal_next_sched: string;
    care_compliance: string;
    health_id: number;
    profile?: {
        firstName: string;
        lastName: string;
    };
}

const UserHome: React.FC = () => {
    const navigation = useIonRouter();
    const [schedules, setSchedules] = useState<VisitSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    
   
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

    useEffect(() => {
        fetchUserSchedules();
        fetchUserName();
    }, []);

    const fetchUserName = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data, error } = await supabase
                    .from('users')
                    .select('userfirstName, userlastName')
                    .eq('auth_id', user.id)
                    .single();
                
                if (data && !error) {
                    // Check if names are null or empty
                    if (data.userfirstName && data.userlastName) {
                        setUserName(`${data.userfirstName} ${data.userlastName}`);
                        setEditFirstName(data.userfirstName);
                        setEditLastName(data.userlastName);
                    } else {
                        // Names are null, set defaults and prompt user to update
                        setUserName('Guest User');
                        setEditFirstName('');
                        setEditLastName('');
                        setToastMessage('Please update your profile with your first and last name');
                        setToastColor('danger');
                        setShowToast(true);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching user name:', err);
        }
    };

    const fetchUserSchedules = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('No user logged in');
                return;
            }

            //console.log('Current user:', user.id);

            // Find user's profile based on auth_id
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('userfirstName, userlastName')
                .eq('auth_id', user.id)
                .single();

           

            if (!userData) {
                setError('User profile not found');
                return;
            }

            // Check if user has set their names
            if (!userData.userfirstName || !userData.userlastName) {
                
                setSchedules([]);
                setError('Please update your profile with your first and last name to view schedules');
                return;
            }

            // Get user's profile from profile table - match by both first and last name
            const { data: profiles, error: profileError } = await supabase
                .from('profile')
                .select('profileid, firstName, lastName')
                .eq('firstName', userData.userfirstName)
                .eq('lastName', userData.userlastName);

            

            if (!profiles || profiles.length === 0) {
                
                setSchedules([]);
                setError('No health profiles found matching your name. Please contact your health worker.');
                return;
            }

            // Get health records for user's profiles
            const profileIds = profiles.map(p => p.profileid);
            

            const { data: healthRecords, error: healthError } = await supabase
                .from('maternalhealthRecord')
                .select('health_id, profileid')
                .in('profileid', profileIds);

           

            if (!healthRecords || healthRecords.length === 0) {
                
                setSchedules([]);
                setError('No health records found. Please contact your health worker.');
                return;
            }

            // Get visit schedules
            const healthIds = healthRecords.map(h => h.health_id);
            

            const { data: visits, error: visitError } = await supabase
                .from('PrenatalPostnatalVisit')
                .select(`
                    visitid,
                    prenatal_visit_num,
                    prenatal_next_sched,
                    postnatal_visit_num,
                    postnatal_next_sched,
                    care_compliance,
                    health_id
                `)
                .in('health_id', healthIds)
                .order('visitid', { ascending: false });

            

            if (visitError) throw visitError;

            // Add profile info to visits
            const schedulesWithProfile = visits?.map(visit => {
                const healthRecord = healthRecords.find(h => h.health_id === visit.health_id);
                const profile = profiles.find(p => p.profileid === healthRecord?.profileid);
                return {
                    ...visit,
                    profile: profile ? {
                        firstName: profile.firstName,
                        lastName: profile.lastName
                    } : undefined
                };
            }) || [];

           
            setSchedules(schedulesWithProfile);
            setError(null); 
        } catch (err: any) {
            console.error('Error fetching schedules:', err);
            setError(err.message || 'Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };
        const handleSaveProfile = async () => {
        if (!editFirstName.trim() || !editLastName.trim()) {
            setToastMessage('First name and last name are required');
            setToastColor('danger');
            setShowToast(true);
            return;
        }

        try {
            setIsSaving(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('No user logged in');
            }

           

            const { data, error } = await supabase
                .from('users')
                .update({
                    userfirstName: editFirstName.trim(),
                    userlastName: editLastName.trim()
                })
                .eq('auth_id', user.id)
                .select();

            console.log('Update response:', { data, error });

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error('No rows were updated. Please check if your user record exists.');
            }

            setUserName(`${editFirstName} ${editLastName}`);
            setToastMessage('Profile updated successfully!');
            setToastColor('success');
            setShowToast(true);

            // Refresh schedules to reflect name changes
            await fetchUserSchedules();
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setToastMessage('Failed to update profile: ' + err.message);
            setToastColor('danger');
            setShowToast(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await fetchUserSchedules();
        event.detail.complete();
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error.message);
                return;
            }
            localStorage.clear();
            navigation.push('/', 'forward', 'replace');
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const isUpcoming = (dateString: string) => {
        if (!dateString) return false;
        const schedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return schedDate >= today;
    };

    return (
        <>
            {/* Side Menu for Profile Edit */}
            <IonMenu contentId="main-content" type="overlay">
                <IonHeader>
                    <IonToolbar style={{ '--background': '#002d54' }}>
                        <IonTitle style={{ color: '#fff', fontWeight: 'bold' }}>
                            Edit Profile
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent style={{ '--background': '#f5f5f5' }}>
                    <IonCard style={{ '--background': '#f5f5f5' }}>
                        <IonCardHeader>
                            <IonCardTitle style={{ color: '#002d54', display: 'flex', alignItems: 'center' }}>
                                <IonIcon icon={personCircleOutline} style={{ marginRight: '10px', fontSize: '24px' }} />
                                Personal Information
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem lines="none" style={{ '--background': '#fff', marginBottom: '15px',  }}>
                                <IonInput
                                    label="First Name"
                                    labelPlacement="floating"
                                    fill="outline"
                                    value={editFirstName}
                                    onIonChange={(e) => setEditFirstName(e.detail.value!)}
                                    style={{ '--color': '#000', marginTop: '10px' }}
                                />
                            </IonItem>
                            
                            <IonItem lines="none" style={{ '--background': '#fff', marginBottom: '20px' }}>
                                <IonInput
                                    label="Last Name"
                                    labelPlacement="floating"
                                    fill="outline"
                                    value={editLastName}
                                    onIonChange={(e) => setEditLastName(e.detail.value!)}
                                    style={{ '--color': '#000', marginTop: '10px' }}
                                />
                            </IonItem>

                            <IonButton
                                expand="block"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                style={{
                                    '--background': '#002d54',
                                    marginTop: '10px',
                                    color: '#fff'
                                }}
                            >
                                <IonIcon icon={saveOutline} slot="start" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </IonButton>

                            <IonButton 
                                expand="block"
                                onClick={handleLogout}
                                color="danger"
                                style={{ color: '#fff' }}
                            >
                                <IonIcon icon={logOutOutline} slot="start" />
                                Logout
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonContent>
            </IonMenu>

            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar style={{ '--background': '#002d54' }}>
                        <IonMenuButton slot="start" style={{ color: '#fff' }} />
                        <IonTitle style={{ color: '#fff', fontWeight: 'bold' }}>
                            My Health Schedules
                        </IonTitle>
                        
                    </IonToolbar>
                </IonHeader>

                <IonContent style={{ '--background': '#f5f5f5' }}>
                    <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                        <IonRefresherContent></IonRefresherContent>
                    </IonRefresher>

                    <div style={{ padding: '20px' }}>
                        {/* Welcome Card */}
                        <IonCard style={{ borderRadius: '15px', marginBottom: '20px', '--background': '#002d54' }}>
                            <IonCardContent>
                                <h2 style={{ color: '#fff', margin: '10px 0' }}>
                                    Welcome, {userName || 'User'}!
                                </h2>
                                <p style={{ color: '#e0e0e0', fontSize: '14px' }}>
                                    Here are your upcoming prenatal and postnatal schedules
                                </p>
                            </IonCardContent>
                        </IonCard>

                        {loading && (
                            <IonCard style={{ '--background': '#ffffff' }}>
                                <IonCardContent>
                                    <IonText color="medium">Loading your schedules...</IonText>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {error && (
                            <IonCard style={{ '--background': '#fee' }}>
                                <IonCardContent>
                                    <IonText color="danger">{error}</IonText>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {!loading && !error && schedules.length === 0 && (
                            <IonCard style={{ '--background': '#ffffff' }}>
                                <IonCardContent>
                                    <IonText color="medium">
                                        <p style={{ textAlign: 'center', padding: '20px' }}>
                                            No schedules found. Please contact your health worker to set up your appointments.
                                        </p>
                                    </IonText>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {!loading && schedules.length > 0 && (
                            <IonGrid>
                                {schedules.map((schedule) => (
                                    <IonRow key={schedule.visitid}>
                                        <IonCol size="12">
                                            <IonCard style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '--background': '#ffffff' }}>
                                                <IonCardHeader>
                                                    <IonCardTitle style={{ color: '#002d54', fontSize: '1.1rem' }}>
                                                        {schedule.profile ? 
                                                            `${schedule.profile.firstName} ${schedule.profile.lastName}` : 
                                                            'Schedule'
                                                        }
                                                    </IonCardTitle>
                                                </IonCardHeader>
                                                <IonCardContent>
                                                    {/* Prenatal Schedule */}
                                                    {schedule.prenatal_visit_num > 0 && schedule.prenatal_next_sched && (
                                                        <div style={{
                                                            marginBottom: '15px',
                                                            padding: '12px', 
                                                            background: isUpcoming(schedule.prenatal_next_sched) ? '#e8f5e9' : '#f5f5f5',
                                                            borderRadius: '8px',
                                                            border: isUpcoming(schedule.prenatal_next_sched) ? '2px solid #4caf50' : '1px solid #ddd'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                <IonIcon icon={calendarOutline} style={{ marginRight: '8px', color: '#002d54' }} />
                                                                <strong style={{ color: '#002d54' }}>Prenatal Visit #{schedule.prenatal_visit_num + 1 }</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '28px' }}>
                                                                <IonIcon icon={timeOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                                                                <IonLabel style={{ fontSize: '14px' }}>
                                                                    {formatDate(schedule.prenatal_next_sched)}
                                                                </IonLabel>
                                                            </div>
                                                            {isUpcoming(schedule.prenatal_next_sched) && (
                                                                <div style={{ 
                                                                    marginTop: '8px', 
                                                                    marginLeft: '28px',
                                                                    color: '#4caf50', 
                                                                    fontSize: '12px',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    ● Upcoming
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Postnatal Schedule */}
                                                    {schedule.postnatal_visit_num > 0 && schedule.postnatal_next_sched && (
                                                        <div style={{ 
                                                            padding: '12px', 
                                                            background: isUpcoming(schedule.postnatal_next_sched) ? '#e3f2fd' : '#f5f5f5',
                                                            borderRadius: '8px',
                                                            border: isUpcoming(schedule.postnatal_next_sched) ? '2px solid #2196f3' : '1px solid #ddd'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                <IonIcon icon={calendarOutline} style={{ marginRight: '8px', color: '#002d54' }} />
                                                                <strong style={{ color: '#002d54' }}>Postnatal Visit #{schedule.postnatal_visit_num}</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '28px' }}>
                                                                <IonIcon icon={timeOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                                                                <IonLabel style={{ fontSize: '14px' }}>
                                                                    {formatDate(schedule.postnatal_next_sched)}
                                                                </IonLabel>
                                                            </div>
                                                            {isUpcoming(schedule.postnatal_next_sched) && (
                                                                <div style={{ 
                                                                    marginTop: '8px', 
                                                                    marginLeft: '28px',
                                                                    color: '#2196f3', 
                                                                    fontSize: '12px',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    ● Upcoming
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Compliance Status */}
                                                    {schedule.care_compliance && (
                                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                                                            <IonLabel style={{ fontSize: '12px', color: '#666' }}>
                                                                <strong>Care Compliance:</strong>{' '}
                                                                <span style={{ 
                                                                    color: schedule.care_compliance === 'Compliant' ? '#4caf50' :
                                                                           schedule.care_compliance === 'Non-Compliant' ? '#f44336' : '#ff9800'
                                                                }}>
                                                                    {schedule.care_compliance}
                                                                </span>
                                                            </IonLabel>
                                                        </div>
                                                    )}
                                                </IonCardContent>
                                            </IonCard>
                                        </IonCol>
                                    </IonRow>
                                ))}
                            </IonGrid>
                        )}
                    </div>

                    {/* Toast for notifications */}
                    <IonToast
                        isOpen={showToast}
                        message={toastMessage}
                        duration={3000}
                        color={toastColor}
                        onDidDismiss={() => setShowToast(false)}
                        position="top"
                    />
                </IonContent>
            </IonPage>
        </>
    );
};

export default UserHome;