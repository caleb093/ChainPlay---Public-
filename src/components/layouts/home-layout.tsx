import { Suspense } from "react";
import HomeLayoutClient from "./homelayoutclient";
 
const HomeLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Suspense fallback={null}>
      <HomeLayoutClient>
        {children}
      </HomeLayoutClient>
    </Suspense>
  );
}

export default HomeLayout