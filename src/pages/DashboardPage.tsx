import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {user?.username}!</h1>
      <p className="mt-2 text-muted-foreground">Here's an overview of your smart home.</p>
      {/* Dashboard widgets will go here */}
    </div>
  );
};

export default DashboardPage;
