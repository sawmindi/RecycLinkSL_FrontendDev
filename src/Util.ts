import { environment } from "./environment/environment";
import axios from "axios";

export class Util {
  public static apiPublicUrl(path: string): string {
    return environment.api_url + "/api/public/" + path;
  }

  public static apiAuthUrl(path: string): string {
    return environment.api_url + "/api/auth/" + path;
  }

  public static initAxios(): void {
    axios.interceptors.request.use(req => {
      req.headers.authorization = "Bearer " + localStorage.getItem("token");
      return req;
    });

    axios.interceptors.response.use(
      function (response) {
        return response.data;
      },
      function (error) {
        return { success: false, data: undefined, error: error };
      }
    );
  }

  public static fileURL(photoId?: string) {
    if (photoId) {
      const url = environment.api_url + environment.file_access_url + "/" + photoId + "/" + localStorage.getItem("token");
      return url;
    } else {
      return "";
    }
  }
}

Util.initAxios();
