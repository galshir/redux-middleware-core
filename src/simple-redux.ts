import { Store, Dispatch, Action } from "redux";
import axios, { Method, AxiosRequestHeaders } from "axios";

interface SimpleAction extends Action {
    api: ApiAction;
}

interface ApiAction {
    url?: string;
    method?: Method;
    data?: object;
    onSuccess: (...args: any[]) => { type: string; payload: Object };
    onFailure: (error: Error) => { type: string; payload: { error: Error } };
    headers?: AxiosRequestHeaders;
    payload?: Object;
    type: string;
}

export const middleware =
    ({ dispatch }: Store) =>
    (next: Dispatch) =>
    (action: SimpleAction) => {
        next(action);
        if (action.api) {
            performApiCall(action.api, dispatch);
        }
    };

const performApiCall = async (api: ApiAction, dispatch: Dispatch) => {
    const { url, method, data, onSuccess, onFailure, headers } = api;
    try {
        const response = await axios({ url, method, headers: { "Content-Type": "application/json", ...headers }, data });
        const actionData = onSuccess(response.data);
        dispatch(actionData);
    } catch (ex) {
        dispatch(onFailure(ex));
    }
};

export const apiAction = ({
    url = "",
    method,
    data,
    onSuccess = (data: object) => ({ type: "SUCCESS", payload: data }),
    onFailure,
    headers,
    payload,
    type = "API",
}: ApiAction) => ({
    type,
    payload,
    metaData: {
        api: {
            url,
            method,
            data,
            onSuccess,
            onFailure,
            headers,
        },
    },
});

export const apiError = (error: Error, onFailureCallback?: (error: Error) => {}) => {
    if (onFailureCallback) {
        onFailureCallback(error);
    }
    return {
        type: "API_ERROR",
        payload: {
            error,
        },
    };
};
