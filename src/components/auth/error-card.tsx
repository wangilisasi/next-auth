import { TriangleAlert } from "lucide-react"
import { CardWrapper } from "./card-wrapper"


export const ErrorCard=()=>{
    return(
        <CardWrapper headerLabel="Opps! Something went wrong" backButtonHref="/auth/login" backButtonLabel="Back to login">
            <div className="w-full flex items-center justify-center">
            <TriangleAlert className="text-destructive"/>
            </div>
           
        </CardWrapper>
    )
}