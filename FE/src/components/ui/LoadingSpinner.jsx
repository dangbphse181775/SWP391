import { Spinner } from "@/components/ui/spinner";

export default function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div className="flex items-center justify-center w-full py-4 gap-2">
            <Spinner />
            <span className="text-base font-medium">{message}</span>
        </div>
    );
}
