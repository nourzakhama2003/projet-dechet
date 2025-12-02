import { UserProfile } from "./UserProfile"
export interface AppResponse {
    status: number,
    message: string,

    user?: UserProfile,
    users?: UserProfile[],

    time: string

}