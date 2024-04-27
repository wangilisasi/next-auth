//This is a custom reusable hook to get the user

import { useSession } from "next-auth/react";

export const useCurrentUser=()=>{
    const session = useSession()

    const user = session.data?.user
    return user
}