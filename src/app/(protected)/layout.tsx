import { NavBar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="p-10 flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#01935d] to-[#aaf0d0]">
      <NavBar/>
      {children}
    </div>
  );
};

export default ProtectedLayout;
