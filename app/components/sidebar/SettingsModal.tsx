'use client';

// for changing/editing the name and image or profile of the current user

import axios from "axios";
import React, { useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { User } from "@prisma/client";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "../Button";
import Input from "../inputs/Input";
import Modal from "../modals/Modal";

interface SettingsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialImage, setInitialImage] = useState(currentUser?.image || "");
  const [initialName, setInitialName] = useState(currentUser?.name || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name,
      image: currentUser?.image,
    },
  });

  const image = watch("image");
  const name = watch("name");

  useEffect(() => {
    if (isOpen) {
      setInitialImage(currentUser?.image || "");
      setInitialName(currentUser?.name || "");
      setValue('image', currentUser?.image || "");
      setValue('name', currentUser?.name || "");
    }
  }, [isOpen, currentUser, setValue]);

  const handleUpload = (result: any) => {
    const fileType = result.info.resource_type;
    const fileFormat = result.info.format;

    const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (fileType === 'image' && allowedFormats.includes(fileFormat)) {
      setValue('image', result.info.secure_url, { shouldValidate: true });
    } else {
      console.error('Uploaded file is not an allowed image format');
      toast.error('Please upload an image file (jpg, jpeg, png)');
    }
  };

  const handleCancel = () => {
    setValue('image', initialImage, { shouldValidate: true });
    setValue('name', initialName, { shouldValidate: true });
    onClose();
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/settings", data)
      .then(() => {
        router.refresh();
        onClose();
        // toast.success("User profile updated");
      })
      .catch(() => toast.error("Something went wrong!"))
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Edit your profile information.
            </p>

            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                disabled={isLoading}
                label="Name"
                id="name"
                errors={errors}
                required
                register={register}
              />
              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <Image
                    width="48"
                    height="48"
                    className="rounded-full"
                    src={image || currentUser?.image || "/images/avatar-placeholder.png"}
                    alt="Avatar"
                  />
                  <CldUploadButton
                    options={{ resourceType: 'image', maxFiles: 1 }}
                    onSuccess={handleUpload}
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME}
                  >
                    <Button disabled={isLoading} secondary type="button">
                      Change
                    </Button>
                  </CldUploadButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button disabled={isLoading} secondary onClick={handleCancel}>
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal;
