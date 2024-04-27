"use client"

import { useSession} from "next-auth/react";
import { logout } from "../../../../../actions/logout";
import { useCurrentUser } from "../../../../../hooks/use-current-user";

const SettingsClientPage = () => {
   // const session = useSession()
   const user = useCurrentUser()

    const onClick = ()=>{
        logout()
    }

    return ( 
        <div className="bg-white p-10 rounded-xl">
           
            <form>
                <button onClick={onClick} type="submit">
                    Sign Out
                </button>
            </form>
        </div>

     );
}
 
export default SettingsClientPage;