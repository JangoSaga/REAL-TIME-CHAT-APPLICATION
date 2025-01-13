import { Outlet } from "react-router-dom";
import { SocketProvider } from "./hooks/SocketProvider";
function AppLayout() {
  return (
    <SocketProvider>
      <main>
        <Outlet />
      </main>
    </SocketProvider>
  );
}

export default AppLayout;
