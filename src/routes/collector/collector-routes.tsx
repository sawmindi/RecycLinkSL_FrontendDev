import { Route, Routes } from "react-router-dom"
import { CollectorLayout } from "../../components/layout/CollectorLayout"
import { OverviewPage } from "../../pages/features/collector/overviewPage"
import MyProfilePage from "../../pages/features/citizen/MyProfilePage"
import { PickupsPage } from "../../pages/features/collector/pickupsPage"
import { ScheduleManagementPage } from "../../pages/features/collector/scheduleManagePage"
import { CollectionHistoryPage } from "../../pages/features/collector/collectionHistoryPage"
import { NotificationsPage } from "../../pages/features/collector/notificationPage"

export const CollectorRoutes = () => {
    return (
        <Routes>
        <Route element={<CollectorLayout />}>
            <Route path="overview" element={<OverviewPage/>} />
            <Route path="pickups" element={<PickupsPage />} />
             <Route path="schedule-management" element={<ScheduleManagementPage />} />
            <Route path="collection-history"    element={<CollectionHistoryPage />} />
           <Route path="notifications" element={<NotificationsPage />} /> 
            <Route path="profile" element={<MyProfilePage />} /> 
        </Route>
        </Routes>
         )
}
