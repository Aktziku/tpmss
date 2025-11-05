import { IonBadge, IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonPage, IonRow, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { use, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClients';
import { personOutline, homeOutline, schoolOutline, medicalOutline, peopleOutline, briefcaseOutline, callOutline, heartOutline } from 'ionicons/icons';

interface ViewProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileId: number | null;
}
const ViewProfileModal: React.FC<ViewProfileModalProps> = ({ isOpen, onClose, profileId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [partnerData, setPartnerData] = useState<any>(null);
    const [healthData, setHealthData] = useState<any>(null);

    useEffect(() => {
        if (isOpen && profileId) {
            fetchProfileData();
        }
    }, [isOpen, profileId]);

    const fetchProfileData = async () => {
        if (!profileId) return;
        setLoading(true);
        setError(null);

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profile')
                .select('*')
                .eq('profileid', profileId)
                .single();

            if (profileError) {
                setError(profileError.message);
            }

            const { data: partner, error: partnerError } = await supabase
                .from('partnersInfo')
                .select('*')
                .eq('profileid', profileId)
                .maybeSingle();

            const { data: health, error: healthError } = await supabase
                .from('maternalhealthRecord')
                .select('*')
                .eq('profileid', profileId)
                .maybeSingle();

            setProfileData(profile);
            setPartnerData(partner);
            setHealthData(health);
        } catch (error: any) {
            console.error('Error fetching profile data', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatMedicalHistory = (medicalHistory: string) => {
        if (!medicalHistory) return ['N/A'];
        return medicalHistory.split(',').map(item => item.trim());
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{ '--width': '100%', '--height': '100%' }}>
            <IonHeader>
                <IonToolbar
                    style={{
                        '--background': '#002d54',
                        color: '#fff',
                    }}
                >
                    <IonTitle style={{ fontWeight: 'bold' }}>
                        View Profile
                    </IonTitle>

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

            <IonContent className="ion-padding" style={{ '--background': '#f5f5f5' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <IonSpinner name="crescent" />
                    </div>
                ) : error ? (
                    <IonText color="danger">
                        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Error loading profile: {error}</p>
                    </IonText>
                ) : profileData ? (
                    <>
                        {/* PROFILE INFORMATION */}
                        <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff", marginBottom: '20px' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Profile Details
                                </h2>

                                {/* Basic Information */}
                                <IonItemGroup>
                                    <IonItemDivider
                                        style={{
                                            "--color": "#000",
                                            fontWeight: "bold",
                                            "--background": "#fff",
                                        }}
                                    >
                                        Teenage Basic Information
                                    </IonItemDivider>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Profile ID:</strong> {profileData.profileid}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>First Name:</strong> {profileData.firstName}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Last Name:</strong> {profileData.lastName}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Age:</strong> {profileData.age || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Date of Birth:</strong> {profileData.birthdate || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Contact Number:</strong> {profileData.contactnum || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Marital Status:</strong>{' '}
                                                    <IonBadge color={profileData.marital_status === 'Single' ? 'primary' : 'success'}>
                                                        {profileData.marital_status || 'N/A'}
                                                    </IonBadge>
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Religion:</strong> {profileData.religion || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Living With:</strong> {profileData.living_with || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Indigenous Ethnicity:</strong> {profileData.indigenous_ethnicity || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Father's Occupation:</strong> {profileData.fathers_occupation || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Mother's Occupation:</strong> {profileData.mothers_occupation || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Family Income:</strong> {profileData.family_income || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>

                                {/* Address Information */}
                                <IonItemGroup>
                                    <IonItemDivider
                                        style={{
                                            "--color": "#000",
                                            fontWeight: "bold",
                                            "--background": "#fff",
                                        }}
                                    >
                                        Address Information
                                    </IonItemDivider>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Region:</strong> {profileData.region || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Province:</strong> {profileData.province || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>City/Municipality:</strong> {profileData.municipality || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Barangay:</strong> {profileData.barangay || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Zipcode:</strong> {profileData.zipcode || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>

                                {/* Educational Background */}
                                <IonItemGroup>
                                    <IonItemDivider
                                        style={{
                                            "--color": "#000",
                                            fontWeight: "bold",
                                            "--background": "#fff",
                                        }}
                                    >
                                        Educational Background
                                    </IonItemDivider>
                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Current Year Level:</strong> {profileData.current_year_level || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Highest Educational Attainment:</strong> {profileData.highest_educational_attainment || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>
                            </IonCardContent>
                        </IonCard>

                        {/* PARTNER INFORMATION */}
                        {partnerData && (
                            <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff", marginBottom: '20px' }}>
                                <IonCardContent>
                                    <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                        Partner Information
                                    </h2>

                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                "--color": "#000",
                                                fontWeight: "bold",
                                                "--background": "#fff",
                                            }}
                                        >
                                            Partner Details
                                        </IonItemDivider>

                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>First Name:</strong> {partnerData.pFirstname || 'N/A'}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Last Name:</strong> {partnerData.pLastname || 'N/A'}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>

                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Birthday:</strong> {partnerData.pBirthday || 'N/A'}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>

                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Occupation:</strong> {partnerData.pOccupation || 'N/A'}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Income:</strong> {partnerData.pIncome || 'N/A'}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </IonItemGroup>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {/* HEALTH STATUS */}
                        {healthData && (
                            <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff", marginBottom: '20px' }}>
                                <IonCardContent>
                                    <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                        Health Status
                                    </h2>

                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                "--color": "#000",
                                                fontWeight: "bold",
                                                "--background": "#fff",
                                            }}
                                        >
                                            Pregnancy Information
                                        </IonItemDivider>

                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Pregnancy Status:</strong>{' '}
                                                        <IonBadge color={healthData.pregnancy_status === 'Pregnant' ? 'success' : 'medium'}>
                                                            {healthData.pregnancy_status || 'N/A'}
                                                        </IonBadge>
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Stage of Pregnancy:</strong> {healthData.stage_of_pregnancy || 'N/A'}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>

                                        <IonRow>
                                            <IonCol size="12">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel style={{ whiteSpace: 'normal' }}>
                                                        <strong>Medical History:</strong>
                                                        <div style={{ marginTop: '8px' }}>
                                                            {formatMedicalHistory(healthData.medical_history).length > 0 ? (
                                                                formatMedicalHistory(healthData.medical_history).map((condition: string, index: number) => (
                                                                    <IonBadge
                                                                        key={index}
                                                                        color="danger"
                                                                        style={{
                                                                            margin: '4px',
                                                                            padding: '8px 12px',
                                                                            fontSize: '0.9rem'
                                                                        }}
                                                                    >
                                                                        {condition}
                                                                    </IonBadge>
                                                                ))
                                                            ) : (
                                                                <em>No medical history recorded</em>
                                                            )}
                                                        </div>
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </IonItemGroup>
                                </IonCardContent>
                            </IonCard>
                        )}
                    </>
                ) : (
                    <IonCard>
                        <IonCardContent>
                            <IonText color="medium">
                                <p style={{ textAlign: 'center' }}>No profile data available</p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}
            </IonContent>
        </IonModal>
    );
};

export default ViewProfileModal;