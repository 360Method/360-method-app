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
import Services from './pages/Services';
import HomeCare from './pages/HomeCare';
import FindOperator from './pages/FindOperator';
import PropertyCare from './pages/PropertyCare';
import Checkout from './pages/Checkout';
import Welcome from './pages/Welcome';
import Waitlist from './pages/Waitlist';
import Pricing from './pages/Pricing';
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
    "Services": Services,
    "HomeCare": HomeCare,
    "FindOperator": FindOperator,
    "PropertyCare": PropertyCare,
    "Checkout": Checkout,
    "Welcome": Welcome,
    "Waitlist": Waitlist,
    "Pricing": Pricing,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};