import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Search from "../components/search";
import NavBar from "../components/NavBar";

export default async function Home() {
  const session = await getServerSession(authOptions);

  

  return (
    <div>
      <NavBar user={session?.user} />
      <Search />
    </div>
  );
}
