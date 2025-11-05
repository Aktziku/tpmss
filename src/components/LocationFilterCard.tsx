import React from 'react';
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSkeletonText,
} from '@ionic/react';
import { closeCircle } from 'ionicons/icons';
import { LocationFilter } from '../services/reportServices';

interface LocationFilterCardProps {
    locationFilter: LocationFilter;
    availableLocations: {
        regions: string[];
        provinces: string[];
        municipalities: string[];
        barangays: string[];
    };
    onFilterChange: (field: keyof LocationFilter, value: any) => void;
    onApplyFilter: () => void;
    onClearFilter: () => void;
    getLocationFilterText: () => string;
    loading?: boolean;
}

const LocationFilterCard: React.FC<LocationFilterCardProps> = ({
    locationFilter,
    availableLocations,
    onFilterChange,
    onApplyFilter,
    onClearFilter,
    getLocationFilterText,
    loading = false,
}) => {

    if (loading) {
        return (
            <IonCard style={{ marginBottom: '20px' }}>
                <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '18px' }}>Location Filter</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonGrid style={{ padding: 0 }}>
                        <IonRow>
                            <IonCol size="12" sizeMd="6">
                                <IonSkeletonText animated style={{ width: '30%', height: '12px', marginBottom: '8px' }} />
                                <IonSkeletonText animated style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <IonSkeletonText animated style={{ width: '40%', height: '12px', marginBottom: '8px' }} />
                                <IonSkeletonText animated style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="12">
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <IonSkeletonText animated style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
                                    <IonSkeletonText animated style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
                                </div>
                                <IonSkeletonText animated style={{ width: '60%', height: '13px', marginTop: '10px' }} />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
            </IonCard>
        );
    }
    return (
        <IonCard style={{ marginBottom: '20px' }}>
            <IonCardHeader>
                <IonCardTitle style={{ fontSize: '18px' }}>Location Filter</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonGrid style={{ padding: 0 }}>
                    <IonRow>
                        <IonCol size="12" sizeMd="6">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Filter By</IonLabel>
                                <IonSelect
                                    value={locationFilter.filterType}
                                    onIonChange={(e) => onFilterChange('filterType', e.detail.value)}
                                    interface="popover"
                                >
                                    <IonSelectOption value="all">All Locations</IonSelectOption>
                                    <IonSelectOption value="region">Region</IonSelectOption>
                                    <IonSelectOption value="province">Province</IonSelectOption>
                                    <IonSelectOption value="municipality">Municipality</IonSelectOption>
                                    <IonSelectOption value="barangay">Barangay</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonCol>

                        {locationFilter.filterType === 'region' && (
                            <IonCol size="12" sizeMd="6">
                                <IonItem lines="none">
                                    <IonLabel position="stacked">Select Region</IonLabel>
                                    <IonSelect
                                        value={locationFilter.region}
                                        onIonChange={(e) => onFilterChange('region', e.detail.value)}
                                        interface="popover"
                                    >
                                        {availableLocations.regions.map(region => (
                                            <IonSelectOption key={region} value={region}>{region}</IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        )}

                        {locationFilter.filterType === 'province' && (
                            <IonCol size="12" sizeMd="6">
                                <IonItem lines="none">
                                    <IonLabel position="stacked">Select Province</IonLabel>
                                    <IonSelect
                                        value={locationFilter.province}
                                        onIonChange={(e) => onFilterChange('province', e.detail.value)}
                                        interface="popover"
                                    >
                                        {availableLocations.provinces.map(province => (
                                            <IonSelectOption key={province} value={province}>{province}</IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        )}

                        {locationFilter.filterType === 'municipality' && (
                            <IonCol size="12" sizeMd="6">
                                <IonItem lines="none">
                                    <IonLabel position="stacked">Select Municipality</IonLabel>
                                    <IonSelect
                                        value={locationFilter.municipality}
                                        onIonChange={(e) => onFilterChange('municipality', e.detail.value)}
                                        interface="popover"
                                    >
                                        {availableLocations.municipalities.map(municipality => (
                                            <IonSelectOption key={municipality} value={municipality}>{municipality}</IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        )}

                        {locationFilter.filterType === 'barangay' && (
                            <IonCol size="12" sizeMd="6">
                                <IonItem lines="none">
                                    <IonLabel position="stacked">Select Barangay</IonLabel>
                                    <IonSelect
                                        value={locationFilter.barangay}
                                        onIonChange={(e) => onFilterChange('barangay', e.detail.value)}
                                        interface="popover"
                                    >
                                        {availableLocations.barangays.map(barangay => (
                                            <IonSelectOption key={barangay} value={barangay}>{barangay}</IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        )}
                    </IonRow>
                    <IonRow>
                        <IonCol size="12">
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <IonButton onClick={onApplyFilter} color="primary">
                                    Apply Filter
                                </IonButton>
                                <IonButton onClick={onClearFilter} fill="outline" color="medium">
                                    <IonIcon slot="start" icon={closeCircle} />
                                    Clear Filter
                                </IonButton>
                            </div>
                            <p style={{ fontSize: '13px', marginTop: '10px', color: '#666' }}>
                                Current Filter: <strong>{getLocationFilterText()}</strong>
                            </p>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonCardContent>
        </IonCard>
    );
};

export default LocationFilterCard;