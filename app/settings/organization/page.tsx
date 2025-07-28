"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DefaultPageLayout from "@/components/ui/layouts/DefaultPageLayout";
import SettingsMenu from "@/components/ui/components/SettingsMenu";
import {
  FeatherBuilding, FeatherImage, FeatherFileText, FeatherGlobe, FeatherLock, FeatherUsers,
  FeatherUploadCloud, FeatherHelpCircle, FeatherX
} from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import Alert from "@/ui/components/Alert";
import TextArea from "@/components/ui/components/TextArea";
import TextField from "@/components/ui/components/TextField";
import { Select } from "@/components/ui/components/Select";
import Button from "@/components/ui/components/Button";

export default function OrganizationSettingsPage() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full items-start flex-nowrap gap-0">
        <SettingsMenu className="min-w-[220px]">
          <span className="w-full text-heading-3 font-heading-3 text-default-font">Settings</span>
          <div className="flex w-full flex-col items-start gap-2 mt-4">
            <SettingsMenu.Item
              selected
              icon={<FeatherBuilding />}
              label="Organization Settings"
              onClick={() => router.push("/settings/organization")}
            />
            <SettingsMenu.Item
              icon={<FeatherImage />}
              label="Branding"
              onClick={() => router.push("/settings/branding")}
            />
            <SettingsMenu.Item
              icon={<FeatherFileText />}
              label="Templates"
              onClick={() => router.push("/settings/templates")}
            />
          </div>
          <div className="flex w-full flex-col items-start gap-2 mt-6">
            <SettingsMenu.Item
              icon={<FeatherGlobe />}
              label="Domain"
              onClick={() => router.push("/settings/domain")}
            />
            <SettingsMenu.Item
              icon={<FeatherLock />}
              label="SSO"
              onClick={() => router.push("/settings/sso")}
            />
            <SettingsMenu.Item
              icon={<FeatherUsers />}
              label="Team Members"
              onClick={() => router.push("/settings/team-members")}
            />
          </div>
        </SettingsMenu>
        <main className="container max-w-none flex grow flex-col items-center gap-12 self-stretch bg-default-background py-12 shadow-sm px-6 md:px-12">
          <h2 className="text-heading-2 font-heading-2 text-default-font">Organization Settings</h2>
          <p className="text-body font-body text-subtext-color mb-6">
            Configure your organization&apos;s settings and preferences
          </p>
          <Alert
            variant="brand"
            title="Complete your organization setup"
            description="Upload your organization's logo and configure essential settings to get started."
            actions={
              <IconButton size="medium" icon={<FeatherX />} onClick={() => {}} />
            }
          />
          <TextArea label="Organization Details" helpText="Provide information about your organization">
            <TextArea.Input className="w-full min-h-[112px]" placeholder="Enter your organization details..." value="" onChange={() => {}} />
          </TextArea>
          <div>
            <p className="text-body-bold font-body-bold text-default-font mb-2">Organization Logo</p>
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border px-6 py-6">
              <FeatherUploadCloud className="text-heading-1 font-heading-1 text-neutral-400" />
              <p className="text-body font-body text-default-font text-center">Drop your logo here or click to upload</p>
              <p className="text-caption font-caption text-subtext-color text-center">SVG, PNG or JPG (max. 800x400px)</p>
            </div>
          </div>
          <TextField label="Public Name" helpText="This name will be visible to your users">
            <TextField.Input placeholder="Enter your organization's public name" value="" onChange={() => {}} />
          </TextField>
          <div>
            <label className="text-body-bold font-body-bold text-default-font">Default Template</label>
            <p className="text-caption font-caption text-subtext-color">Choose the default template for new release notes</p>
            <Select value={undefined} onValueChange={() => {}}>
              <option value="" disabled selected>
                Select a default template
              </option>
              <option value="modern">modern</option>
              <option value="minimal">minimal</option>
            </Select>
          </div>
          <div className="flex w-full justify-between items-center mt-8">
            <Button variant="neutral-tertiary" icon={<FeatherHelpCircle />} onClick={() => {}}>
              View documentation
            </Button>
            <div className="flex gap-2">
              <Button variant="neutral-tertiary" onClick={() => {}}>Reset</Button>
              <Button onClick={() => {}}>Save Changes</Button>
            </div>
          </div>
        </main>
      </div>
    </DefaultPageLayout>
  );
}

// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import DefaultPageLayout from "@/components/ui/layouts/DefaultPageLayout";
// import SettingsMenu from "@/components/ui/components/SettingsMenu";
// import { 
//   FeatherBuilding, FeatherImage, FeatherFileText, FeatherGlobe, FeatherLock, FeatherUsers,
//   FeatherUploadCloud, FeatherHelpCircle, FeatherX
// } from "@subframe/core";
// import { IconButton } from "@/ui/components/IconButton";
// import Alert from "@/ui/components/Alert";
// import TextArea from "@/components/ui/components/TextArea";
// import TextField from "@/components/ui/components/TextField";
// import Select from "@/components/ui/components/Select";
// import Button from "@/components/ui/components/Button";

// export default function OrganizationSettingsPage() {
//   const router = useRouter();

//   return (
//     <DefaultPageLayout>
//       <div className="flex h-full w-full items-start flex-nowrap gap-0">
//         <SettingsMenu className="min-w-[220px]">
//           <span className="w-full text-heading-3 font-heading-3 text-default-font">Settings</span>

//           <div className="flex w-full flex-col items-start gap-2">
//             <span className="w-full text-body-bold font-body-bold text-default-font">Organization</span>
//             <SettingsMenu.Item
//               selected={true}
//               icon={<FeatherBuilding />}
//               label="Organization Settings"
//               onClick={() => router.push("/settings/organization")}
//             />
//             <SettingsMenu.Item
//               icon={<FeatherImage />}
//               label="Branding"
//               onClick={() => router.push("/settings/branding")}
//             />
//             <SettingsMenu.Item
//               icon={<FeatherFileText />}
//               label="Templates"
//               onClick={() => router.push("/settings/templates")}
//             />
//           </div>

//           <div className="flex w-full flex-col items-start gap-2 mt-6">
//             <span className="w-full text-body-bold font-body-bold text-default-font">Access</span>
//             <SettingsMenu.Item
//               icon={<FeatherGlobe />}
//               label="Domain"
//               onClick={() => router.push("/settings/domain")}
//             />
//             <SettingsMenu.Item
//               icon={<FeatherLock />}
//               label="SSO"
//               onClick={() => router.push("/settings/sso")}
//             />
//             <SettingsMenu.Item
//               icon={<FeatherUsers />}
//               label="Team Members"
//               onClick={() => router.push("/settings/team-members")}
//             />
//           </div>
//         </SettingsMenu>

//         <main className="container max-w-none flex grow flex-col items-center gap-12 self-stretch bg-default-background py-12 shadow-sm px-6 md:px-12">
//           <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
//             <h2 className="text-heading-2 font-heading-2 text-default-font">Organization Settings</h2>
//             <p className="text-body font-body text-subtext-color">
//               Configure your organization&apos;s settings and preferences
//             </p>
//             <Alert
//               variant="brand"
//               title="Complete your organization setup"
//               description="Upload your organization's logo and configure essential settings to get started."
//               actions={
//                 <IconButton size="medium" icon={<FeatherX />} onClick={() => {}} />
//               }
//             />
//             <TextArea label="Organization Details" helpText="Provide information about your organization">
//               <TextArea.Input
//                 className="w-full min-h-[112px]"
//                 placeholder="Enter your organization details..."
//                 value=""
//                 onChange={() => {}}
//               />
//             </TextArea>
//             <div>
//               <p className="text-body-bold font-body-bold text-default-font mb-2">Organization Logo</p>
//               <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border px-6 py-6">
//                 <FeatherUploadCloud className="text-heading-1 font-heading-1 text-neutral-400" />
//                 <p className="text-body font-body text-default-font text-center">
//                   Drop your logo here or click to upload
//                 </p>
//                 <p className="text-caption font-caption text-subtext-color text-center">
//                   SVG, PNG or JPG (max. 800x400px)
//                 </p>
//               </div>
//             </div>
//             <TextField label="Public Name" helpText="This name will be visible to your users">
//               <TextField.Input
//                 placeholder="Enter your organization's public name"
//                 value=""
//                 onChange={() => {}}
//               />
//             </TextField>
//             <Select
//               label="Default Template"
//               placeholder="Select a default template"
//               helpText="Choose the default template for new release notes"
//               value={undefined}
//               onValueChange={() => {}}
//             >
//               <Select.Item value="traditional">traditional</Select.Item>
//               <Select.Item value="modern">modern</Select.Item>
//               <Select.Item value="minimal">minimal</Select.Item>
//             </Select>

//             <div className="flex w-full flex-wrap justify-between gap-4">
//               <Button variant="secondary" onClick={() => {}}>
//                 <FeatherHelpCircle className="mr-2" />
//                 View documentation
//               </Button>
//               <div className="flex gap-2">
//                 <Button variant="secondary" onClick={() => {}}>Reset</Button>
//                 <Button onClick={() => {}}>Save Changes</Button>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </DefaultPageLayout>
//   );
// }

// // "use client";

// // import React from "react";
// // import { DefaultPageLayout } from "@/components/ui/layouts/DefaultPageLayout";
// // import { SettingsMenu } from "@/components/ui/components/SettingsMenu";
// // import { FeatherBuilding } from "@subframe/core";
// // import { FeatherImage } from "@subframe/core";
// // import { FeatherFileText } from "@subframe/core";
// // import { FeatherGlobe } from "@subframe/core";
// // import { FeatherLock } from "@subframe/core";
// // import { FeatherUsers } from "@subframe/core";
// // import { IconButton } from "@/ui/components/IconButton";
// // import { FeatherX } from "@subframe/core";
// // import { Alert } from "@/ui/components/Alert";
// // import { TextArea } from "@/components/ui/components/TextArea";
// // import { FeatherUploadCloud } from "@subframe/core";
// // import { TextField } from "@/components/ui/components/TextField";
// // import { Select } from "@/ui/components/Select";
// // import { Button } from "@/ui/components/Button";
// // import { FeatherHelpCircle } from "@subframe/core";

// // function MinimalistSettingsHub() {
// //   return (
// //     /* connect the pages to the approprite position in side bar
// //      */
// //     <DefaultPageLayout>
// //       <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
// //         <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0">
// //           <span className="w-full text-heading-3 font-heading-3 text-default-font">
// //             Settings
// //           </span>
// //           <div className="flex w-full flex-col items-start gap-2">
// //             <span className="w-full text-body-bold font-body-bold text-default-font">
// //               Organization
// //             </span>
// //             <div className="flex w-full flex-col items-start gap-1">
// //               <SettingsMenu.Item
// //                 selected={true}
// //                 icon={<FeatherBuilding />}
// //                 label="Organization Settings"
// //               />
// //               <SettingsMenu.Item icon={<FeatherImage />} label="Branding" />
// //               <SettingsMenu.Item icon={<FeatherFileText />} label="Templates" />
// //             </div>
// //           </div>
// //           <div className="flex w-full flex-col items-start gap-2">
// //             <span className="w-full text-body-bold font-body-bold text-default-font">
// //               Access
// //             </span>
// //             <div className="flex w-full flex-col items-start gap-1">
// //               <SettingsMenu.Item icon={<FeatherGlobe />} label="Domain" />
// //               <SettingsMenu.Item icon={<FeatherLock />} label="SSO" />
// //               <SettingsMenu.Item icon={<FeatherUsers />} label="Team Members" />
// //             </div>
// //           </div>
// //         </SettingsMenu>
// //         <div className="container max-w-none flex grow shrink-0 basis-0 flex-col items-center gap-12 self-stretch bg-default-background py-12 shadow-sm">
// //           <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
// //             <div className="flex w-full flex-col items-start gap-1">
// //               <span className="w-full text-heading-2 font-heading-2 text-default-font">
// //                 Organization Settings
// //               </span>
// //               <span className="text-body font-body text-subtext-color">
// //                 Configure your organization&#39;s settings and preferences
// //               </span>
// //             </div>
// //             <div className="flex w-full flex-col items-start gap-6">
// //               <Alert
// //                 variant="brand"
// //                 title="Complete your organization setup"
// //                 description="Upload your organization's logo and configure essential settings to get started."
// //                 actions={
// //                   <IconButton
// //                     size="medium"
// //                     icon={<FeatherX />}
// //                     onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
// //                   />
// //                 }
// //               />
// //               <div className="flex w-full flex-col items-start gap-6">
// //                 <TextArea
// //                   label="Organization Details"
// //                   helpText="Provide information about your organization"
// //                 >
// //                   <TextArea.Input
// //                     className="h-auto min-h-[112px] w-full flex-none"
// //                     placeholder="Enter your organization details..."
// //                     value=""
// //                     onChange={(
// //                       event: React.ChangeEvent<HTMLTextAreaElement>
// //                     ) => {}}
// //                   />
// //                 </TextArea>
// //                 <div className="flex w-full flex-col items-start gap-4">
// //                   <span className="text-body-bold font-body-bold text-default-font">
// //                     Organization Logo
// //                   </span>
// //                   <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border px-6 py-6">
// //                     <FeatherUploadCloud className="text-heading-1 font-heading-1 text-neutral-400" />
// //                     <div className="flex flex-col items-center justify-center gap-1">
// //                       <span className="text-body font-body text-default-font text-center">
// //                         Drop your logo here or click to upload
// //                       </span>
// //                       <span className="text-caption font-caption text-subtext-color text-center">
// //                         SVG, PNG or JPG (max. 800x400px)
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //                 <TextField
// //                   label="Public Name"
// //                   helpText="This name will be visible to your users"
// //                 >
// //                   <TextField.Input
// //                     placeholder="Enter your organization's public name"
// //                     value=""
// //                     onChange={(
// //                       event: React.ChangeEvent<HTMLInputElement>
// //                     ) => {}}
// //                   />
// //                 </TextField>
// //                 <div className="flex flex-col">
// //                   <label className="text-body-bold font-body-bold text-default-font">
// //                     Default Template
// //                   </label>
// //                   <span className="text-caption font-caption text-subtext-color">
// //                     Choose the default template for new release notes
// //                   </span>
// //                   <Select
// //                     value={undefined}
// //                     onValueChange={(value: string) => {}}
// //                   >
// //                     <option value="" disabled selected>
// //                       Select a default template
// //                     </option>
// //                     <option value="traditional">traditional</option>
// //                     <option value="modern">modern</option>
// //                     <option value="minimal">minimal</option>
// //                   </Select>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
// //             <div className="flex w-full flex-col items-start gap-2">
// //               <div className="flex w-full flex-wrap items-center justify-between">
// //                 <Button
// //                   variant="neutral-tertiary"
// //                   icon={<FeatherHelpCircle />}
// //                   onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
// //                 >
// //                   View documentation
// //                 </Button>
// //                 <div className="flex items-center justify-end gap-2">
// //                   <Button
// //                     variant="neutral-tertiary"
// //                     onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
// //                   >
// //                     Reset
// //                   </Button>
// //                   <Button
// //                     onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
// //                   >
// //                     Save Changes
// //                   </Button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </DefaultPageLayout>
// //   );
// // }

// // export default MinimalistSettingsHub;