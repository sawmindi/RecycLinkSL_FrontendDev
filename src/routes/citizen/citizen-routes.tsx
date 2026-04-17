import { Route, Routes } from "react-router-dom"
import { AddItemPage } from "../../pages/features/citizen/addItemPage"
import { SchedulePage } from "../../pages/features/citizen/schedulePage"
import { MyItemsPage } from "../../pages/features/citizen/myItemsPage"
import { EarningsPage } from "../../pages/features/citizen/earningsPage"
import { HistoryPage } from "../../pages/features/citizen/historyPage"
import { CitizenLayout } from "../../components/layout/CitizenLayout"
import OverviewPage from "../../pages/features/citizen/overviewPage"
import MyProfilePage from "../../pages/features/citizen/MyProfilePage"
// import { NotificationsPage } from "../../pages/features/citizen/notificationPage"

export const CitizenRoutes = () => {
    return (
        <Routes>
        <Route element={<CitizenLayout />}>
            <Route path="overview" element={<OverviewPage/>} />
            <Route path="add-item" element={<AddItemPage />} />
            <Route path="schedules" element={<SchedulePage />} />
            <Route path="my-items"    element={<MyItemsPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="history"  element={<HistoryPage />} />
            {/* <Route path="notifications" element={<NotificationsPage />} /> */}
            <Route path="profile" element={<MyProfilePage />} />
        </Route>
        </Routes>
         )
}
