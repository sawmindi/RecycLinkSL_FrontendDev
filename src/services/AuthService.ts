import axios from "axios";
import { AppResponse } from "../models/Response";
import { Util } from "../Util";
import { User, UserData } from "../models/User";

export interface UserLoginData {
  phoneNumber: string;
  password: string;
}
export interface CitizenSignupRequest {
  full_name: string;
  username: string;
  email: string;
  phoneNumber: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  password: string;
}
export interface SignupOtpVerificationRequest {
  userId: string;
  verificationCode: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = "token";

  public static async userLogin(userLoginData: UserLoginData): Promise<AppResponse<string>> {
    const ep = Util.apiPublicUrl("login");
    const res = (await axios.post(ep, userLoginData)) as unknown as AppResponse<string>;
    if (res.success) {
      localStorage.setItem(AuthService.TOKEN_KEY, res.data); 
    }
    return res;
  }

  public static async getMe(): Promise<AppResponse<User>> {
    const ep = Util.apiAuthUrl("me");

    const res = (await axios.get(ep)) as unknown as AppResponse<User>;

    if (res.error) {
      localStorage.removeItem(AuthService.TOKEN_KEY);
    }

    return res;
  }

  public static async citizenSignUp(
    data: CitizenSignupRequest
  ): Promise<AppResponse<User>> {
    const ep = Util.apiPublicUrl("signUp");
    return (await axios.post(ep, data)) as unknown as AppResponse<User>;
  }

  public static async verifyCitizenSignupOtp(
    data: SignupOtpVerificationRequest
  ): Promise<AppResponse<string>> {
    const ep = Util.apiPublicUrl("signUpOTPVerification");
    return (await axios.post(ep, data)) as unknown as AppResponse<string>;
  }

  public static async updateUser(userId: string, data: UserData | undefined): Promise<AppResponse<User>> {
    const ep = Util.apiAuthUrl("update-user/" + userId);

    return (await axios.post(ep, data)) as unknown as AppResponse<User>;
  }

  public static userLogout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY); 
  }

  public static getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY); 
  }

  public static setToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token); 
  }
}
