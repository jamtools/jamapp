import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router';
import type {Module} from 'springboard/module_registry/module_registry';

type Props = React.PropsWithChildren<{
    modules: Module[];
}>;

export const ApplicationShell = (props: Props) => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <Header />
            <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                <Sidebar modules={props.modules} />
                <main style={{flex: 1, overflow: 'auto', padding: '20px'}}>
                    {props.children}
                </main>
            </div>
        </div>
    );
};

const Header = () => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.style.colorScheme = isDark ? 'light' : 'dark';
    };

    return (
        <header style={{
            padding: '10px 20px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            <h1 style={{margin: 0, fontSize: '20px'}}>JamTools</h1>
            <button onClick={toggleTheme}>
                {isDark ? '☀️' : '🌙'} Toggle Theme
            </button>
        </header>
    );
};

type SidebarProps = {
    modules: Module[];
};

const Sidebar = (props: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    // Parse current location to highlight active module/route
    const parsed = location.pathname.split('/');
    let activeModuleId = '';
    let activeSubpath = '';

    if (parsed.includes('modules')) {
        const modIdx = parsed.indexOf('modules');
        activeModuleId = parsed[modIdx + 1] || '';
        activeSubpath = parsed.slice(modIdx + 2).join('/');
    }

    const modulesWithRoutes = props.modules.filter(m => m.routes);

    const navigateToRoute = (moduleId: string, route: string) => {
        if (route.startsWith('/')) {
            navigate(route);
            return;
        }
        navigate(`/modules/${moduleId}/${route}`);
    };

    return (
        <nav style={{
            width: '250px',
            borderRight: '1px solid #ccc',
            overflow: 'auto',
            padding: '10px',
        }}>
            <h2 style={{fontSize: '14px', marginTop: 0, marginBottom: '10px'}}>Modules</h2>
            {modulesWithRoutes.map(module => {
                const isExpanded = expandedModule === module.moduleId || activeModuleId === module.moduleId;
                const routes = module.routes || {};
                const routeKeys = Object.keys(routes);

                return (
                    <div key={module.moduleId} style={{marginBottom: '10px'}}>
                        <button
                            onClick={() => {
                                setExpandedModule(isExpanded ? null : module.moduleId);
                                // Navigate to default route
                                if ('/' in routes) {
                                    navigateToRoute(module.moduleId, '/');
                                } else if ('' in routes) {
                                    navigateToRoute(module.moduleId, '');
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                textAlign: 'left',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                background: activeModuleId === module.moduleId ? '#e3f2fd' : 'white',
                                cursor: 'pointer',
                                fontWeight: activeModuleId === module.moduleId ? 'bold' : 'normal',
                            }}
                        >
                            {isExpanded ? '▼' : '▶'} {module.moduleId}
                        </button>

                        {isExpanded && routeKeys.length > 0 && (
                            <div style={{marginLeft: '15px', marginTop: '5px'}}>
                                {routeKeys.map(route => {
                                    const isActive = activeModuleId === module.moduleId && activeSubpath === route;
                                    return (
                                        <button
                                            key={route}
                                            onClick={() => navigateToRoute(module.moduleId, route)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '6px 8px',
                                                textAlign: 'left',
                                                border: 'none',
                                                background: isActive ? '#bbdefb' : 'transparent',
                                                cursor: 'pointer',
                                                borderRadius: '3px',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {route || 'Home'}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};
