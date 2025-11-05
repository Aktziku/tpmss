import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { supabase } from '../../../utils/supabaseClients';
import AddEnrollRecordModal from '../../../components/AddEnrollRecordModal';
import ViewEducation from '../../../components/view/ViewEducation';

interface EducationProps {
    educationid: number;
    profileid: number;
    typeOfProgram: string;
    programCourse: string;
    status: string;
    institutionOrCenter: string;
    enroll_dropout_Date: string;
    gradeLevel: string;
    firstName?: string;
    lastName?: string;
};

interface EducProps {
    searchQuery?: string;
}

const Education: React.FC<EducProps> = ({ searchQuery = '' }) => {
    const [Education, setEducation] = useState<EducationProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEducation, setEditingEducation] = useState<EducationProps | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEducationId, setSelectedEducationId] = useState<number | null>(null);
    

    useIonViewWillEnter(() => {
        //console.log("Education view entered");
        setLoading(true);
        fetchEducation(); 
        setHasFetched(true);
    });

    const handleViewEducation = (educationId: number) => {
        setSelectedEducationId(educationId);
        setShowViewModal(true);
    };

    const fetchEducation = async () => {
        try {
            const {data, error} = await supabase
                .from('EducationAndTraining')
                .select(`
                    educationid,
                    profileid,
                    typeOfProgram,
                    programCourse,
                    status,
                    institutionOrCenter,
                    enroll_dropout_Date,
                    gradeLevel,
                    profile:profileid (firstName,lastName)
                    `);

            if (error) {
                setError(error.message);
                setToastMessage('Error fetching education data');
                setShowToast(true);
            }

            if (data) {
                const formatted = data.map((item:any) => ({
                    ...item,
                    firstName: item.profile?.firstName || '',
                    lastName: item.profile?.lastName || '',
                }));
                setEducation(formatted);
            }

        } catch (error) {
            setError('An unexpected error occurred');
            setToastMessage('An unexpected error occurred');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const filteredEducation = Education.filter(record => {
        const fullName = `${record.firstName} ${record.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    {/* rendering based on loading state */}
    if (loading) {
        return (
            <IonPage>
                <IonContent style={{ '--background': '#ffffffff' }}>
                    <div className="ion-padding">
                        <div className="ion-margin-bottom ion-margin-top">
                            <IonSkeletonText animated style={{ width: '210px', height: '44px', borderRadius: '12px' }} />
                        </div>

                        <IonCard style={{ border: "1px solid #000" }}>
                            <IonCardContent>
                                <IonGrid style={{ "--ion-grid-column-padding": "8px" }}>
                                    {/* Header Skeleton */}
                                    <IonRow style={{ borderBottom: "1px solid #000", paddingBottom: '10px' }}>
                                        <IonCol size="3"><IonSkeletonText animated style={{ width: '70%', height: '16px' }} /></IonCol>
                                        <IonCol size="3"><IonSkeletonText animated style={{ width: '75%', height: '16px' }} /></IonCol>
                                        <IonCol size="2"><IonSkeletonText animated style={{ width: '60%', height: '16px' }} /></IonCol>
                                        <IonCol size="2"><IonSkeletonText animated style={{ width: '80%', height: '16px' }} /></IonCol>
                                        <IonCol size="2"><IonSkeletonText animated style={{ width: '50%', height: '16px' }} /></IonCol>
                                    </IonRow>

                                    {/* Row Skeletons */}
                                    {[1, 2, 3, 4, 5, 6].map((item) => (
                                        <IonRow key={item} style={{ borderBottom: item < 6 ? "1px solid #ccc" : "none", padding: '12px 0' }}>
                                            <IonCol size="3"><IonSkeletonText animated style={{ width: '85%', height: '14px' }} /></IonCol>
                                            <IonCol size="3"><IonSkeletonText animated style={{ width: '90%', height: '14px' }} /></IonCol>
                                            <IonCol size="2"><IonSkeletonText animated style={{ width: '70%', height: '24px', borderRadius: '12px' }} /></IonCol>
                                            <IonCol size="2"><IonSkeletonText animated style={{ width: '80%', height: '14px' }} /></IonCol>
                                            <IonCol size="2"><IonSkeletonText animated style={{ width: '60%', height: '14px' }} /></IonCol>
                                        </IonRow>
                                    ))}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
    return (
        <IonPage>
            <IonContent style={{ '--background': '#ffffffff' }}>

                <IonGrid className="ion-padding">
                    <IonRow className="ion-margin-bottom ion-margin-top">
                        <IonCol size="12" sizeMd="6" sizeLg="4">
                            {/*Button for adding Education Records */}
                            <IonButton
                                className="ion-margin-end"
                                onClick={() => {
                                    setShowAddModal(true);
                                    setIsEditing(false);
                                    setEditingEducation(null);
                                }}
                                style={{
                                    '--background': '#002d54',
                                    color: 'white',
                                    borderRadius: '12px',
                                }}
                            >
                                <IonIcon icon={addOutline} slot="start" />
                                Add Education Record
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {error && (
                        <div className="ion-margin-bottom ion-color-danger">
                            <IonText color="danger">{error}</IonText>
                        </div>
                    )}

                    <IonGrid>
                        <IonCard style={{ border: "1px solid #000",'--background':'#ffffffff' }}>
                            <IonCardContent>
                                <IonGrid style={{ "--ion-grid-column-padding": "8px" }}>
                                    {/* Table Header */}
                                    <IonRow
                                        style={{
                                        borderBottom: "1px solid #000",
                                        fontWeight: "bold",
                                        color: "#000",
                                        textAlign: "center",
                                        }}
                                    >
                                        <IonCol size="12" sizeMd="3">Name</IonCol>
                                        <IonCol size="6" sizeMd="2" className="ion-hide-md-down">Program Type</IonCol>
                                        <IonCol size="6" sizeMd="2" className="ion-hide-md-down">Program/Course</IonCol>
                                        <IonCol size="12" sizeMd="2" className="ion-hide-md-down">Status</IonCol>
                                        <IonCol size="12" sizeMd="3">Action</IonCol>
                                    </IonRow>

                                    {/* Table Rows */}
                                    {filteredEducation.length === 0 ? (
                                        <IonRow>
                                            <IonCol style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                No education records found
                                            </IonCol>
                                        </IonRow>
                                    ) : (
                                        filteredEducation.map((education, index) => (
                                            <IonRow
                                                key={index}
                                                style={{
                                                    borderBottom: index < filteredEducation.length - 1 ? "1px solid #ccc" : "none",
                                                    color: "#000",
                                                    textAlign: "center",
                                                }}
                                                className="ion-align-items-center"
                                            >
                                                <IonCol size="12" sizeMd="3">
                                                    {education.firstName || "No Name"} {education.lastName || ""}
                                                    <pre style={{ fontSize: '10px', color: 'black' }}>
                                                        ID: {education.profileid}
                                                    </pre>
                                                    {/* Mobile-only info */}
                                                    <div className="ion-hide-md-up" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                        <div><strong>Type:</strong> {education.typeOfProgram || 'N/A'}</div>
                                                        <div><strong>Course:</strong> {education.programCourse || 'N/A'}</div>
                                                        <div><strong>Status:</strong> {education.status || 'N/A'}</div>
                                                        <div><strong>Date:</strong> {education.enroll_dropout_Date || 'N/A'}</div>
                                                    </div>
                                                </IonCol>
                                                
                                                {/* Desktop-only columns */}
                                                <IonCol size="6" sizeMd="2" className="ion-hide-md-down">
                                                    {education.typeOfProgram || "N/A"}
                                                </IonCol>
                                                <IonCol size="6" sizeMd="2" className="ion-hide-md-down">
                                                    {education.programCourse || "N/A"}
                                                </IonCol>
                                                <IonCol size="12" sizeMd="2" className="ion-hide-md-down">
                                                    {education.status || "N/A"}
                                                </IonCol>

                                                <IonCol size="12" sizeMd="3">
                                                    <IonButton
                                                        size="small"
                                                        fill="outline"
                                                        color="black"
                                                        style={{
                                                            color: "#000",
                                                            marginRight: "5px",
                                                        }}
                                                        onClick={() => handleViewEducation(education.educationid)}
                                                    >
                                                        View
                                                    </IonButton>
                                                    <IonButton
                                                        size="small"
                                                        fill="outline"
                                                        style={{ marginRight: "5px" }}
                                                        onClick={() => {
                                                            setIsEditing(true);
                                                            setEditingEducation(education);
                                                            setShowAddModal(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </IonButton>
                                                </IonCol>
                                            </IonRow>
                                        ))
                                    )}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>
                    </IonGrid>
                </IonGrid>

                <IonToast
                    isOpen = {showToast}
                    onDidDismiss = {() => setShowToast(false)}
                    message = {toastMessage}
                    duration = {3000}
                    position = "bottom"
                />

                <ViewEducation
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedEducationId(null);
                    }}
                    educationId={selectedEducationId}
                />

                <AddEnrollRecordModal
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingEducation(null);
                    }}
                    onSave={async (record: any) => {
                        await fetchEducation();
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingEducation(null);
                        setToastMessage(isEditing ? 'Education record updated successfully!' : 'Education record saved successfully!');
                        setShowToast(true);
                    }}
                    editingEducation={editingEducation}
                    isEditing={isEditing}
                />
            </IonContent>
        </IonPage>
    );
};

export default Education;