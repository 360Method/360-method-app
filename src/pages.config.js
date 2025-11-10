import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Baseline from './pages/Baseline';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Properties": Properties,
    "Baseline": Baseline,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};