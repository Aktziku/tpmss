import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonPage,
    IonRow,
    IonCol,
    useIonRouter,
    IonSpinner,
    IonText,
    IonSkeletonText,
} from '@ionic/react';
import { key, peopleOutline, readerOutline, schoolOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';
import { supabase } from '../../../utils/supabaseClients';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardStats {
    totalTeenAgeParents: number;
    currentEnrolled: number;
    byProvince: { [key: string]: number };
    byMunicipality: { [key: string]: number };
    byBarangay: { [key: string]: number };
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>({
        totalTeenAgeParents: 0,
        currentEnrolled: 0,
        byProvince: {},
        byMunicipality: {},
        byBarangay: {},
    });
const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);
   
    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            const { count: totalCount} = await supabase
                .from('profile')
                .select('*', { count: 'exact', head: true });

            const { count: enrolledCount} = await supabase
                .from('EducationAndTraining')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Enrolled');

            const {data: profile} = await supabase
                .from('profile')
                .select('province, municipality, barangay');

            const provinceCount: { [key: string]: number } = {};
            const municipalityCount: { [key: string]: number } = {};
            const barangayCount: { [key: string]: number } = {};

            profile?.forEach((item: any) => {
                if (item.province) {
                    provinceCount[item.province] = provinceCount[item.province] ? provinceCount[item.province] + 1 : 1;
                }
                if (item.municipality) {
                    municipalityCount[item.municipality] = municipalityCount[item.municipality] ? municipalityCount[item.municipality] + 1 : 1;
                }
                if (item.barangay) {
                    barangayCount[item.barangay] = barangayCount[item.barangay] ? barangayCount[item.barangay] + 1 : 1;
                }
            });

            setStats({
                totalTeenAgeParents: totalCount || 0,
                currentEnrolled: enrolledCount || 0,
                byProvince: provinceCount,
                byMunicipality: municipalityCount,
                byBarangay: barangayCount,
            });

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const provinceChartData = {
        labels: Object.keys(stats?.byProvince || {}),
        datasets: [
            {
                label: 'Number of Teenage Parents',
                data: Object.values(stats?.byProvince || {}),
                backgroundColor: [
                '#002d54', '#003d6b', '#004d82', '#005d99',
                '#006db0', '#007dc7', '#008dde', '#009df5',
                '#33adff', '#66bdff'
            ],
                borderColor: '#001a33',
                borderWidth: 1,
            },
        ],
    };

    const municipalityChartData = {
        labels: Object.keys(stats?.byMunicipality || {}),
        datasets: [
            {
                label: 'Number of Teenage Parents',
                data: Object.values(stats?.byMunicipality || {}).slice(0, 10),
                backgroundColor: [
                '#002d54', '#003d6b', '#004d82', '#005d99',
                '#006db0', '#007dc7', '#008dde', '#009df5',
                '#33adff', '#66bdff'
            ],
                borderColor: '#001a33',
                borderWidth: 1,
            },
        ],
    };

    const barangayChartData = {
        labels: Object.keys(stats?.byBarangay || {}).slice(0, 10), // Top 10 barangays
        datasets: [
            {
                label: 'Number of Teenage Parents',
                data: Object.values(stats?.byBarangay || {}).slice(0, 10),
                backgroundColor: [
                '#002d54', '#003d6b', '#004d82', '#005d99',
                '#006db0', '#007dc7', '#008dde', '#009df5',
                '#33adff', '#66bdff'
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
        <IonCard style={{ margin: '10px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <IonCardContent style={{ padding: '20px', background: '#ffffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: '0', color: '#002d54', fontSize: '1rem' }}>{title}</h3>
                        <h2 style={{ margin: '10px 0', color: '#002d54', fontSize: '1.8rem', fontWeight: 'bold' }}>{value}</h2>
                    </div>
                    <IonIcon
                        icon={icon}
                        style={{
                            fontSize: '2.5rem',
                            padding: '15px',
                            borderRadius: '12px',
                            backgroundColor: color,
                            color: 'white',
                        }}
                    />
                </div>
            </IonCardContent>
        </IonCard>
    );

    if (loading) {
        return (
            <IonPage>
                <IonContent style={{ '--background': '#ffffffff' }}>
                    <div style={{ padding: '20px' }}>
                        {/* Stats Cards Skeleton */}
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12" sizeMd="6">
                                    <IonCard style={{ margin: '10px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', '--background': '#ffffff' }}>
                                        <IonCardContent style={{ padding: '20px', background: '#ffffffff' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ flex: 1 }}>
                                                    <IonSkeletonText animated style={{ width: '60%', height: '16px', marginBottom: '10px' }} />
                                                    <IonSkeletonText animated style={{ width: '40%', height: '28px' }} />
                                                </div>
                                                <IonSkeletonText animated style={{ width: '65px', height: '65px', borderRadius: '12px' }} />
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                                <IonCol size="12" sizeMd="6">
                                    <IonCard style={{ margin: '10px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                        <IonCardContent style={{ padding: '20px', background: '#ffffffff' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ flex: 1 }}>
                                                    <IonSkeletonText animated style={{ width: '70%', height: '16px', marginBottom: '10px' }} />
                                                    <IonSkeletonText animated style={{ width: '40%', height: '28px' }} />
                                                </div>
                                                <IonSkeletonText animated style={{ width: '65px', height: '65px', borderRadius: '12px' }} />
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        {/* Charts Skeleton */}
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonCard style={{ margin: '20px 0', padding: '20px', borderRadius: '15px', '--background': '#ffffff' }}>
                                        <IonCardHeader>
                                            <IonSkeletonText animated style={{ width: '50%', height: '20px' }} />
                                        </IonCardHeader>
                                        <IonCardContent style={{ height: '400px' }}>
                                            <IonSkeletonText animated style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol size="12" sizeMd="6">
                                    <IonCard style={{ margin: '20px 0', padding: '20px', borderRadius: '15px' }}>
                                        <IonCardHeader>
                                            <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                                        </IonCardHeader>
                                        <IonCardContent style={{ height: '400px' }}>
                                            <IonSkeletonText animated style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>

                                <IonCol size="12" sizeMd="6">
                                    <IonCard style={{ margin: '20px 0', padding: '20px', borderRadius: '15px' }}>
                                        <IonCardHeader>
                                            <IonSkeletonText animated style={{ width: '40%', height: '20px' }} />
                                        </IonCardHeader>
                                        <IonCardContent style={{ height: '400px' }}>
                                            <IonSkeletonText animated style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent style={{ '--background': '#ffffff' }}>
                <div style={{ padding: '20px' }}>
                    {/* Stats Cards */}
                    <IonGrid>
                        <IonRow>
                            <IonCol size="12" sizeMd="6">
                                <StatCard
                                    title="Total Teenage Parents"
                                    value={stats?.totalTeenAgeParents || 0}
                                    icon={peopleOutline}
                                    color="#3498db"
                                />
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <StatCard
                                    title="Currently Enrolled in School/ALS"
                                    value={stats?.currentEnrolled || 0}
                                    icon={schoolOutline}
                                    color="#002d54"
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Charts */}
                    <IonGrid>
                        <IonRow>
                            {/* Province Chart */}
                            <IonCol >
                                <IonCard style={{ margin: '20px 0', padding: '20px', borderRadius: '15px','--background': '#ffffff' }}>
                                    <IonCardHeader>
                                        <IonCardTitle style={{ color: '#002d54' }}>
                                            Teenage Parents by Province
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent style={{ height: '400px', position: 'relative', width: '100%' }}>
                                        {stats && Object.keys(stats.byProvince).length > 0 ? (
                                            <Bar data={provinceChartData} options={chartOptions} />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                                                No data available
                                            </div>
                                        )}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            {/* Municipality Chart */}
                            <IonCol size="12" sizeMd="6">
                                <IonCard style={{ margin: '20px 0', padding: '20px', borderRadius: '15px', '--background': '#ffffff' }}>
                                    <IonCardHeader>
                                        <IonCardTitle style={{ color: '#002d54' }}>
                                            Teenage Parents by Municipality
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent style={{ height: '400px', position: 'relative', width: '100%' }}>
                                        {stats && Object.keys(stats.byMunicipality).length > 0 ? (
                                            <Bar data={municipalityChartData} options={chartOptions} />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                                                No data available
                                            </div>
                                        )}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                            {/* Barangay Chart */}
                            <IonCol size="12" sizeMd="6">
                                <IonCard style={{ margin: '20px 0', padding: '20px', borderRadius: '15px', '--background': '#ffffff' }}>
                                    <IonCardHeader>
                                        <IonCardTitle style={{ color: '#002d54' }}>
                                            Top 10 Barangays
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent style={{ height: '400px', position: 'relative', width: '100%' }}>
                                        {stats && Object.keys(stats.byBarangay).length > 0 ? (
                                            <Pie data={barangayChartData} options={chartOptions} />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                                                No data available
                                            </div>
                                        )}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AdminDashboard;