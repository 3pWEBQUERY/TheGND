"use client";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadImage = ({
    onUploadComplete,
}: {
    onUploadComplete: (url: string) => void;
}) => {
    return (
        <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
                if (res && res[0]) {
                    onUploadComplete(res[0].url);
                }
            }}
            onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
            }}
        />
    );
};
