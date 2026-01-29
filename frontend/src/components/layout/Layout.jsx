import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../Header';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-8 ml-64 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
