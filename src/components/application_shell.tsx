import React, {useState, useEffect, createContext, useContext} from 'react';
import {useLocation, useNavigate} from 'react-router';
import type {Module} from 'springboard/module_registry/module_registry';

type Props = React.PropsWithChildren<{
    modules: Module[];
}>;

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export const ApplicationShell = (props: Props) => {
    const [isDark, setIsDark] = useState(() => {
        // Check initial color scheme
        const scheme = document.documentElement.style.colorScheme;
        return scheme === 'dark';
    });

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.style.colorScheme = isDark ? 'light' : 'dark';
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                color: isDark ? '#e0e0e0' : '#000000',
            }}>
                <Header />
                <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                    <Sidebar modules={props.modules} />
                    <main style={{flex: 1, overflow: 'auto', padding: '20px'}}>
                        {props.children}
                    </main>
                </div>
            </div>
        </ThemeContext.Provider>
    );
};

const Header = () => {
    const { isDark, toggleTheme } = useContext(ThemeContext);

    return (
        <header style={{
            padding: '10px 20px',
            borderBottom: isDark ? '1px solid #444' : '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? '#252525' : '#ffffff',
        }}>
            <h1 style={{margin: 0, fontSize: '20px'}}>JamTools</h1>
            <button
                onClick={toggleTheme}
                style={{
                    padding: '6px 12px',
                    backgroundColor: isDark ? '#3a3a3a' : '#f0f0f0',
                    border: isDark ? '1px solid #555' : '1px solid #ccc',
                    borderRadius: '4px',
                    color: isDark ? '#e0e0e0' : '#000000',
                    cursor: 'pointer',
                }}
            >
                {isDark ? '☀️' : '🌙'} Toggle Theme
            </button>
        </header>
    );
};

type SidebarProps = {
    modules: Module[];
};

const Sidebar = (props: SidebarProps) => {
    const { isDark } = useContext(ThemeContext);
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
            borderRight: isDark ? '1px solid #444' : '1px solid #ccc',
            overflow: 'auto',
            padding: '10px',
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        }}>
            <h2 style={{
                fontSize: '14px',
                marginTop: 0,
                marginBottom: '10px',
                color: isDark ? '#b0b0b0' : '#666',
            }}>
                Modules
            </h2>
            {modulesWithRoutes.map(module => {
                const isExpanded = expandedModule === module.moduleId || activeModuleId === module.moduleId;
                const routes = module.routes || {};
                const routeKeys = Object.keys(routes);
                const isActive = activeModuleId === module.moduleId;

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
                                border: isDark ? '1px solid #444' : '1px solid #ddd',
                                borderRadius: '4px',
                                background: isActive
                                    ? (isDark ? '#2d5a8c' : '#e3f2fd')
                                    : (isDark ? '#2a2a2a' : '#ffffff'),
                                color: isDark ? '#e0e0e0' : '#000000',
                                cursor: 'pointer',
                                fontWeight: isActive ? 'bold' : 'normal',
                            }}
                        >
                            {isExpanded ? '▼' : '▶'} {module.moduleId}
                        </button>

                        {isExpanded && routeKeys.length > 0 && (
                            <div style={{marginLeft: '15px', marginTop: '5px'}}>
                                {routeKeys.map(route => {
                                    const isRouteActive = activeModuleId === module.moduleId && activeSubpath === route;
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
                                                background: isRouteActive
                                                    ? (isDark ? '#1e4d7a' : '#bbdefb')
                                                    : 'transparent',
                                                color: isDark ? '#d0d0d0' : '#000000',
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
