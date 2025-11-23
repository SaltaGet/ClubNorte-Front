import Footer from "@/components/headfoot/Footer";
import Header from "@/components/headfoot/Header";
import Admin from "@/pages/Admin/Admin";
import ChangePassword from "@/pages/ChangePassword/ChangePassword";
import Home from "@/pages/Home/Home";
import PointSale from "@/pages/PointSale/PointSaleCore/PointSale";
import DownloadReports from "@/pages/Reports/ReportFor/DownloadReports";
import ProfitableProductsReport from "@/pages/Reports/ReportFor/ProfitableProductsReport";
import ReportBase from "@/pages/Reports/ReportFor/ReportBase";
import StockControlReport from "@/pages/Reports/ReportFor/StockControlReport";
import StockMovementsReport from "@/pages/Reports/ReportFor/StockMovementsReport";
import Reports from "@/pages/Reports/Reports";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster } from "sonner";

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    <Toaster position="top-center" />
  </>
);

const routers = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <h1>FAIL HOME</h1>,
      },
      {
        path: "/admin",
        element: <Admin />,
        errorElement: <h1>FAIL ADMIN</h1>,
      },
      {
        path: "point-sale/:id",
        element: <PointSale />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "reports/puntos-venta-rentabilidad",
        element: <ReportBase />,
      },
      {
        path: "reports/productos-rentables",
        element: <ProfitableProductsReport />,
      },
      {
        path: "reports/informe-stock",
        element: <StockControlReport />,
      },
      {
        path: "reports/stock-movement",
        element: <StockMovementsReport/>,
      },
      {
        path: "reports/descargar-informe",
        element: <DownloadReports/>,
      },
    ],
  },
]);

function RoutesWeb() {
  return <RouterProvider router={routers} />;
}

export default RoutesWeb;