import { Route, Routes } from "react-router-dom"
import { AdminLayout } from "../../components/layout/AdminLayout"
import { OverviewPage } from "../../pages/features/admin/overviewPage"
import { MyProfilePage } from "../../pages/features/admin/myProfilePage"
import {PickupScheduleManagementPage} from "../../pages/features/admin/pickupSchedule"
import { CategoriesPage } from "../../pages/features/admin/categories"
import CollectorAssignmentPage from "../../pages/features/admin/collectorAssignment"
import PriceManagementPage from "../../pages/features/admin/priceManagement"

export const AdminRoutes = () => {
    return (
        <Routes>
        <Route element={<AdminLayout />}>
             <Route path="overview" element={<OverviewPage/>} />
             <Route path="profile" element={<MyProfilePage />} />
            <Route path="pickup-schedule" element={<PickupScheduleManagementPage />} />
            <Route path="categories" element={<CategoriesPage/>}/>
            <Route path="collector-assignment" element={<CollectorAssignmentPage/>} />
            <Route path="price-management" element={<PriceManagementPage/>} />
            {/* <Route path="user-management" element={<UserManagementPage/>} /> */}
                {/* <Route path="route-optimisation" element={< RouteOptimisation Page/>} /> */}
             {/*<Route path="schedule-management" element={<ScheduleManagementPage />} />
            <Route path="collection-history"    element={<CollectionHistoryPage />} />
           <Route path="notifications" element={<NotificationsPage />} /> 
              */}
        </Route>
        </Routes>
         )
}
