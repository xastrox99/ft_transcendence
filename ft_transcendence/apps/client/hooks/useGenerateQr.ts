import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

export default function useGenerateQr () {

    const {isLoading , isError , error , isSuccess ,data } = useQuery({retry:0,
        queryKey: ['qrCode'],
        throwOnError: false,
        queryFn : () => api.api().otp.getImage(),
    })

    return {
        isLoading, 
        isError, 
        error,
        isSuccess,
        data 
    }
}