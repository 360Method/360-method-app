import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Baseline from './pages/Baseline';
import Inspect from './pages/Inspect';
import Track from './pages/Track';
import Prioritize from './pages/Prioritize';
import Schedule from './pages/Schedule';
import Execute from './pages/Execute';
import Preserve from './pages/Preserve';
import Upgrade from './pages/Upgrade';
import Scale from './pages/Scale';
import Settings from './pages/Settings';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Properties": Properties,
    "Baseline": Baseline,
    "Inspect": Inspect,
    "Track": Track,
    "Prioritize": Prioritize,
    "Schedule": Schedule,
    "Execute": Execute,
    "Preserve": Preserve,
    "Upgrade": Upgrade,
    "Scale": Scale,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};