/*
Service for the server in the application.
*/
import { getApiUrl } from "#/utils/service";
import axios, { AxiosResponse } from "axios";

const storageInstance = axios.create({
	baseURL: `${getApiUrl()}/shared`,
	timeout: 1000,
});

type SharedResponse = {
	result: string;
};

type SharedResult = string;

export async function getSharedValue(text: string): Promise<SharedResult> {
	// send request
	async function sendRequest() {
		return (
			storageInstance
				.request({
					url: `/${text}`,
					method: "GET",
				})
				// handle response
				.then((response: AxiosResponse<SharedResponse>) => {
					const { result } = response.data;
					return result;
				})
				// catch errors
				.catch((error) => {
					console.log("problem", error);
					return "ERROR";
				})
		);
	}

	return sendRequest();
}
