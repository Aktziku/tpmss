import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonPage, IonRow, IonSpinner, IonText, IonTitle, IonToolbar, IonBadge } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClients';
import { schoolOutline, documentTextOutline, calendarOutline, ribbonOutline } from 'ionicons/icons';

interface ViewEducationProps {
    isOpen: boolean;
    onClose: () => void;
    educationId: number | null;
}

interface EducationData {
    educationid: number;
    profileid: number;
    typeOfProgram: string;
    programCourse: string;
    status: string;
    institutionOrCenter: string;
    enroll_dropout_Date: string;
    gradeLevel: string;
}

interface ProfileData {
    profileid: number;
    firstName: string;
    lastName: string;
    birthdate: string;
    age: number;
    contactnum: string;
    barangay: string;
    municipality: string;
    province: string;
}

const ViewEducation: React.FC<ViewEducationProps> = ({ isOpen, onClose, educationId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [educationData, setEducationData] = useState<EducationData | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        if (isOpen && educationId) {
            fetchEducationData();
        }
    }, [isOpen, educationId]);

    const fetchEducationData = async () => {
        if (!educationId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch education record
            const { data: education, error: educationError } = await supabase
                .from('EducationAndTraining')
                .select('*')
                .eq('educationid', educationId)
                .single();

            if (educationError) {
                console.error('Error fetching education data:', educationError);
                throw educationError;
            }

            setEducationData(education);

            // Fetch profile data
            if (education?.profileid) {
                const { data: profile, error: profileError } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('profileid', education.profileid)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile data:', profileError);
                    throw profileError;
                }

                setProfileData(profile);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'enrolled':
                return 'success';
            case 'dropout':
                return 'danger';
            case 'graduated':
                return 'primary';
            case 'on hold':
                return 'warning';
            default:
                return 'medium';
        }
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: string }) => (
        <IonRow className="ion-align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
            <IonCol size="12" sizeMd="4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon && <IonIcon icon={icon} style={{ color: '#002d54', fontSize: '18px' }} />}
                    <IonText style={{ fontWeight: 'bold', color: '#555' }}>{label}</IonText>
                </div>
            </IonCol>
            <IonCol size="12" sizeMd="8">
                <IonText style={{ color: '#000' }}>{value || 'N/A'}</IonText>
            </IonCol>
        </IonRow>
    );

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
                        Education Record Details
                    </IonTitle>

                    <IonButton
                        slot="end"
                        onClick={onClose}
                        style={{
                            '--background': '#fff',
                            '--color': '#000000',
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
                    <IonCard style={{ background: '#fee', border: '1px solid #fcc' }}>
                        <IonCardContent>
                            <IonText color="danger">
                                <h3>Error Loading Data</h3>
                                <p>{error}</p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                ) : educationData ? (
                    <IonGrid>
                        {/* Profile Information Card */}
                        <IonCard style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Personal Information
                                </h2>
                                <IonGrid>
                                    <InfoRow 
                                        label="Full Name" 
                                        value={`${profileData?.firstName || ''} ${profileData?.lastName || ''}`}
                                    />
                                    <InfoRow 
                                        label="Profile ID" 
                                        value={profileData?.profileid || 'N/A'}
                                    />
                                    <InfoRow 
                                        label="Age" 
                                        value={profileData?.age || 'N/A'}
                                    />
                                    <InfoRow 
                                        label="Contact Number" 
                                        value={profileData?.contactnum || 'N/A'}
                                    />
                                    <InfoRow 
                                        label="Address" 
                                        value={`${profileData?.barangay || ''}, ${profileData?.municipality || ''}, ${profileData?.province || ''}`}
                                    />
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>

                        {/* Education Details Card */}
                        <IonCard style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Education Information
                                </h2>
                                <IonGrid>
                                    <InfoRow 
                                        label="Education ID" 
                                        value={educationData.educationid}
                                        icon={documentTextOutline}
                                    />
                                    <InfoRow 
                                        label="Type of Program" 
                                        value={educationData.typeOfProgram}
                                        icon={schoolOutline}
                                    />
                                    <InfoRow 
                                        label="Program/Course" 
                                        value={educationData.programCourse}
                                    />
                                    <InfoRow 
                                        label="Grade Level" 
                                        value={educationData.gradeLevel}
                                        icon={ribbonOutline}
                                    />
                                    <InfoRow 
                                        label="Institution/Center" 
                                        value={educationData.institutionOrCenter}
                                    />
                                    
                                    {/* Status with Badge */}
                                    <IonRow className="ion-align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                                        <IonCol size="12" sizeMd="4">
                                            <IonText style={{ fontWeight: 'bold', color: '#555' }}>Status</IonText>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="8">
                                            <IonBadge color={getStatusColor(educationData.status)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                                {educationData.status || 'N/A'}
                                            </IonBadge>
                                        </IonCol>
                                    </IonRow>

                                    <InfoRow 
                                        label="Enrollment/Dropout Date" 
                                        value={educationData.enroll_dropout_Date ? new Date(educationData.enroll_dropout_Date).toLocaleDateString() : 'N/A'}
                                        icon={calendarOutline}
                                    />
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>

                        {/* Additional Information */}
                        {educationData.status?.toLowerCase() === 'dropout' && (
                            <IonCard style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
                                <IonCardContent>
                                    <IonText color="warning">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IonIcon icon={schoolOutline} style={{ fontSize: '24px' }} />
                                            <div>
                                                <strong>Dropout Alert</strong>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                                    This individual has dropped out of the program. Follow-up may be needed.
                                                </p>
                                            </div>
                                        </div>
                                    </IonText>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {educationData.status?.toLowerCase() === 'graduated' && (
                            <IonCard style={{ background: '#d4edda', border: '1px solid #28a745' }}>
                                <IonCardContent>
                                    <IonText color="success">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IonIcon icon={ribbonOutline} style={{ fontSize: '24px' }} />
                                            <div>
                                                <strong>Congratulations!</strong>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                                    Successfully completed the program.
                                                </p>
                                            </div>
                                        </div>
                                    </IonText>
                                </IonCardContent>
                            </IonCard>
                        )}
                    </IonGrid>
                ) : (
                    <IonCard>
                        <IonCardContent>
                            <IonText color="medium">
                                <p style={{ textAlign: 'center' }}>No education data available</p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}
            </IonContent>
        </IonModal>
    );
};

export default ViewEducation;