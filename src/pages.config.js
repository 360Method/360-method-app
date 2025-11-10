import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Properties": Properties,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};