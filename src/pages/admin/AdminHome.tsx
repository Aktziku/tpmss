import {
    IonApp,
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonPage,
    IonRouterOutlet,
    IonSearchbar,
    IonSplitPane,
    IonTabBar,
    IonTabButton,
    IonTitle,
    IonToolbar,
    useIonRouter
} from '@ionic/react';
import { Redirect, useLocation } from 'react-router-dom';
import { documentAttachOutline, gridOutline, logoIonic, logOutOutline, menuOutline, peopleOutline, personOutline, readerOutline, schoolOutline, statsChartOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Route } from 'react-router';
import AdminDashboard from './Tabs/AdminDashboard';
import ProfileManagement from './Tabs/ProfileManagement';
import Education from './Tabs/Education';
import { supabase } from '../../utils/supabaseClients';
import CaseManagement from './Tabs/CaseManagement';
import { Session } from '@supabase/supabase-js';
import UserManagement from './Tabs/UserManagement';
import HealthMonitoring from './Tabs/HealthMonitoring';
import Reports from './Tabs/Reports';


const AdminHome: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const navigation = useIonRouter();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [importing, setImporting] = useState(false);
    
    const [userDetails, setUserDetails] = useState<{role:string} | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false); 
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // array for sidebar items
    const roleTabs: Record<string,Array<{name:string;url:string;icon:string}>> = {
        admin: [
            { name: 'Dashboard', url: '/admin/dashboard', icon: gridOutline },
            { name: 'Profiling', url: '/admin/profiles', icon: peopleOutline },
            { name: 'Health Monitoring', url: '/admin/health', icon: readerOutline},
            { name: 'Education And Training', url: '/admin/education', icon: schoolOutline },
            { name: 'Case Management', url:'/admin/case', icon: documentAttachOutline },
            { name: 'Reports & Analytics', url:'/admin/reports', icon: statsChartOutline },
            { name: 'User Management', url:'/admin/userManagement', icon: personOutline },
        ],

        healthworker: [ 
            { name: 'Dashboard', url: '/admin/dashboard', icon: gridOutline }, 
            { name: 'Health Monitoring', url: '/admin/health', icon: readerOutline},
            { name: 'Profiling', url: '/admin/profiles', icon: peopleOutline },
        ],
        socialworker: [
            { name: 'Dashboard', url: '/admin/dashboard', icon: gridOutline },
            { name: 'Case Management', url: '/admin/case', icon: documentAttachOutline },
        ],
        school: [
            { name: 'Dashboard', url: '/admin/dashboard', icon: gridOutline },
            { name: 'Education And Training', url: '/admin/education', icon: schoolOutline },
        ],
    };

    const tabsToRender = userDetails?.role ? roleTabs[userDetails.role] || [] : [];

    // Function to get current page title
    const getCurrentTitle = () => {
        const currentPath = location.pathname;
        const allTabs = Object.values(roleTabs).flat();
        const currentTab = allTabs.find(tab => tab.url === currentPath);
        return currentTab ? currentTab.name : 'Dashboard';
    };

     const getSearchPlaceholder = () => {
        const currentPath = location.pathname;
        switch(currentPath) {
            case '/admin/profiles':
                return 'Search profiles...';
            case '/admin/health':
                return 'Search health records...';
            case '/admin/education':
                return 'Search education records...';
            case '/admin/case':
                return 'Search cases...';
            case '/admin/userManagement':
                return 'Search users...';
            default:
                return 'Search...';
        }
    };

    const fetchProfiles = async (id = "") => {
        if (!id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq("auth_id", id)

            if (error) {
                setError(error.message);
                setToastMessage('Error fetching profiles');
                setShowToast(true);
                setUserDetails({ role: '' });
            }
            if (data && data.length > 0) {
                setUserDetails({role:data[0].role})
            } else {
                 //console.log("No role found for auth_id:", id);
                 setUserDetails({ role: '' });
            }
        }
        catch (error) {
            setError('An unexpected error occurred');
            setToastMessage('An unexpected error occurred');
            setShowToast(true);
        }
        finally {
            setLoading(false);
        }
    };

    const [session, setSession] = useState<Session | null>(null)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
             setSession(session);
        })
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            fetchProfiles(session?.user.id)
        })
        return () => subscription.unsubscribe()
    }, [])
    
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error.message);
                return;
            }
            localStorage.clear();
            navigation.push('/', 'forward', 'replace');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        setSearchQuery('');
    }, [location.pathname]);
    // Sidebar content component (reusable for both desktop and mobile)
    const SidebarContent = ({ isMobileMenu = false }: { isMobileMenu?: boolean }) => (
        <div
            style={{
                background: '#002d54',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}
        >
            {/* Mobile menu header */}
            {isMobileMenu && (
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <IonTitle style={{ color: '#fff', fontSize: '1.2rem' }}>Menu</IonTitle>
                </div>
            )}

            <IonList
                style={{
                    background: 'transparent',
                    marginTop: isMobileMenu ? '0' : '10px',
                    flex: 1
                }}
            >
                {tabsToRender.map((item, index) => {
                    const isActive = location.pathname === item.url;

                    return (
                        <IonMenuToggle key={index} autoHide={false}>
                            <IonItem
                                routerLink={item.url}
                                lines='none'
                                button
                                onClick={() => isMobileMenu && setSidebarOpen(false)}
                                style={{
                                    '--background': isActive ? '#0d6efd' : 'transparent',
                                    '--color': '#ffffff',
                                    margin: '4px 8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                <IonIcon
                                    icon={item.icon}
                                    slot="start"
                                    style={{
                                        fontSize: '20px',
                                        color: '#ffffff',
                                        marginRight: '12px'
                                    }}
                                />
                                <IonLabel
                                    style={{
                                        color: '#ffffff',
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        fontSize: isMobileMenu ? '16px' : '14px'
                                    }}
                                >
                                    {item.name}
                                </IonLabel>
                            </IonItem>
                        </IonMenuToggle>
                    );
                })}

                {/* Logout Button */}
                <IonMenuToggle autoHide={false}>
                    <IonItem
                        lines='none'
                        button
                        onClick={() => {
                            handleLogout();
                            if (isMobileMenu) setSidebarOpen(false);
                        }}
                        style={{
                            '--background': 'rgba(220, 53, 69, 0.2)',
                            '--color': '#ffffff',
                            margin: '16px 8px 8px 8px',
                            borderRadius: '8px',
                            marginTop: 'auto'
                        }}
                    >
                        <IonIcon
                            icon={logOutOutline}
                            slot="start"
                            style={{
                                fontSize: '20px',
                                color: '#ffffff',
                                marginRight: '12px'
                            }}
                        />
                        <IonLabel
                            style={{
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: isMobileMenu ? '16px' : '14px'
                            }}
                        >
                            Logout
                        </IonLabel>
                    </IonItem>
                </IonMenuToggle>
            </IonList>
        </div>
    );

    return (
        <IonApp>
            {/* Mobile Menu */}
            <IonMenu
                contentId="main-content"
                side="start"
                type="overlay"
                disabled={!isMobile}
            >
                <SidebarContent isMobileMenu={true} />
            </IonMenu>

            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar
                        style={{
                            '--background':'#002d54',
                            '--min-height': '60px',
                            '--border-shadow': '0'
                        }}
                    >
                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <IonMenuButton
                                slot="start"
                                style={{
                                    color: '#ffffff',
                                    '--color': '#ffffff'
                                }}
                            />
                        )}

                        {/* Logo and Title */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: isMobile ? '0' : '16px'
                        }}>
                            <IonTitle
                                style={{
                                    fontSize: isMobile ? '16px' : 'clamp(16px, 2vw, 20px)',
                                    color: '#F3E8FF',
                                    fontWeight: 'bold'
                                }}
                            >
                                {getCurrentTitle()}
                            </IonTitle>
                        </div>

                        {/* Desktop Searchbar */}
                        {!isMobile && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                                slot='end'
                            >
                                <IonSearchbar
                                    className='ion-margin-end'
                                    placeholder={getSearchPlaceholder()}
                                    value={searchQuery}
                                    onIonChange={e => setSearchQuery(e.detail.value!)} 
                                    debounce={300}
                                    style={{
                                        width: 'clamp(200px, 40vw, 400px)',
                                        '--background': '#ffffff',
                                        '--border-radius': '20px',
                                        '--placeholder-color': '#002d54',
                                        '--placeholder-opacity': '1',
                                        '--icon-color': '#000000',
                                        fontSize: 'clamp(12px, 1vw, 14px)',
                                        color: '#000000',
                                    }}
                                />
                            </div>
                        )}
                    </IonToolbar>

                    {/* Mobile Searchbar */}
                    {isMobile && (
                        <IonToolbar
                            style={{
                                '--background': '#ffffff',
                                '--border-color': 'transparent'
                            }}
                        >
                            <IonSearchbar
                                placeholder={getSearchPlaceholder()}
                                value={searchQuery}
                                onIonChange={e => setSearchQuery(e.detail.value!)} 
                                debounce={300}
                                style={{
                                    '--background': '#f8f9fa',
                                    '--border-radius': '12px',
                                    '--placeholder-color': '#6c757d',
                                    '--icon-color': '#6c757d',
                                    margin: '8px'
                                }}
                            />
                        </IonToolbar>
                    )}
                </IonHeader>

                <IonContent>
                    {!isMobile ? (
                        // Desktop Layout with Split Pane
                        <IonSplitPane when="md" contentId="main">
                            {/* Desktop Sidebar */}
                            <div
                                style={{
                                    width: isHovered ? '250px' : '70px',
                                    transition: 'width 0.3s ease-in-out',
                                    background: '#002d54',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minWidth: '70px'
                                }}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <IonList
                                    style={{
                                        background: 'transparent',
                                        marginTop: '10px',
                                        flex: 1
                                    }}
                                >
                                    {tabsToRender.map((item, index) => {
                                        const isActive = location.pathname === item.url;

                                        return (
                                            <IonItem
                                                key={index}
                                                routerLink={item.url}
                                                lines='none'
                                                style={{
                                                    '--background': isActive ? '#0d6efd' : 'transparent',
                                                    '--color': '#ffffff',
                                                    margin: '4px 8px',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.3s ease-in-out',
                                                    minHeight: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                <IonIcon
                                                    icon={item.icon}
                                                    style={{
                                                        fontSize: '20px',
                                                        color: '#ffffff',
                                                        marginRight: isHovered ? '12px' : '0px',
                                                        transition: 'margin 0.3s ease-in-out'
                                                    }}
                                                />
                                                </div>
                                                {isHovered && (
                                                    <IonLabel
                                                        style={{
                                                            color: '#ffffff',
                                                            fontWeight: isActive ? 'bold' : 'normal',
                                                            opacity: isHovered ? 1 : 0,
                                                            transition: 'opacity 0.3s ease-in-out',
                                                            whiteSpace: 'nowrap',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {item.name}
                                                    </IonLabel>
                                                )}
                                            </IonItem>
                                        );
                                    })}

                                    {/* Desktop Logout Button */}
                                    <IonItem
                                        lines='none'
                                        button
                                        onClick={handleLogout}
                                        style={{
                                            '--background': 'rgba(220, 53, 69, 0.2)',
                                            '--color': '#ffffff',
                                            margin: '16px 8px 8px 8px',
                                            borderRadius: '8px',
                                            marginTop: 'auto',
                                            minHeight: '48px'
                                        }}
                                    >
                                        <div>
                                        <IonIcon
                                            icon={logOutOutline}
                                            style={{
                                                fontSize: '20px',
                                                color: '#ffffff',
                                                marginRight: isHovered ? '12px' : '0px',
                                                transition: 'margin 0.3s ease-in-out'
                                            }}
                                        />
                                        </div>
                                        {isHovered && (
                                            <IonLabel
                                                style={{
                                                    color: '#ffffff',
                                                    fontWeight: 'bold',
                                                    opacity: isHovered ? 1 : 0,
                                                    transition: 'opacity 0.3s ease-in-out',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Logout
                                            </IonLabel>
                                        )}
                                    </IonItem>
                                </IonList>
                            </div>

                            {/* Main Content */}
                            <div
                                id="main"
                                style={{
                                    flex: 1,
                                    padding: 'clamp(12px, 2vw, 20px)',
                                    overflow: 'auto',
                                    background: '#fdf6f9'
                                }}
                            >
                                <IonRouterOutlet>
                                    <Route path="/admin" exact>
                                        <Redirect to="/admin/dashboard" />
                                    </Route>
                                    <Route exact path="/admin/dashboard" render={() => <AdminDashboard />} />
                                    <Route exact path="/admin/profiles" render={() => <ProfileManagement searchQuery={searchQuery} />} />
                                    <Route exact path="/admin/health" render={() => <HealthMonitoring searchQuery={searchQuery} />} />
                                    <Route exact path="/admin/education" render={() => <Education searchQuery={searchQuery} />} />
                                    <Route exact path="/admin/case" render={() => <CaseManagement searchQuery={searchQuery} />} />
                                    <Route exact path="/admin/reports" render={() => <Reports />} />
                                    <Route exact path="/admin/userManagement" render={() => <UserManagement searchQuery={searchQuery} />} />
                                </IonRouterOutlet>
                            </div>
                        </IonSplitPane>
                    ) : (
                        // Mobile Layout - Full Width Content
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: '12px',
                                overflow: 'auto',
                                background: '#fdf6f9'
                            }}
                        >
                            <IonRouterOutlet>
                                <Route path="/admin" exact>
                                    <Redirect to="/admin/dashboard" />
                                </Route>
                                <Route exact path="/admin/dashboard" render={() => <AdminDashboard  />} />
                                <Route exact path="/admin/profiles" render={() => <ProfileManagement searchQuery={searchQuery} />} />
                                <Route exact path="/admin/health" render={() => <HealthMonitoring searchQuery={searchQuery} />} />
                                <Route exact path="/admin/education" render={() => <Education searchQuery={searchQuery} />} />
                                <Route exact path="/admin/case" render={() => <CaseManagement searchQuery={searchQuery} />} />
                                <Route exact path="/admin/reports" render={() => <Reports />} />
                                <Route exact path="/admin/userManagement" render={() => <UserManagement searchQuery={searchQuery} />} />
                            </IonRouterOutlet>
                        </div>
                    )}
                </IonContent>
            </IonPage>
        </IonApp>
    );
};

export default AdminHome;