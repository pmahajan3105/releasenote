"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DefaultPageLayout from "@/components/ui/layouts/DefaultPageLayout";
import SettingsMenu from "@/components/ui/components/SettingsMenu";
import { 
  FeatherBuilding, FeatherImage, FeatherFileText, FeatherGlobe, FeatherLock, FeatherUsers,
  FeatherDroplet, FeatherDownload 
} from "@subframe/core";
import TextField from "@/components/ui/components/TextField";
import { Select } from "@/components/ui/components/Select";
import TextArea from "@/components/ui/components/TextArea";
import Button from "@/components/ui/components/Button";

export default function BrandShowcasePage() {
  const router = useRouter();

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full items-start flex-nowrap gap-0">
        <SettingsMenu className="min-w-[220px]">
          <span className="w-full text-heading-3 font-heading-3 text-default-font">Settings</span>

          <div className="flex w-full flex-col items-start gap-2">
            <span className="w-full text-body-bold font-body-bold text-default-font">Organization</span>
            <SettingsMenu.Item
              icon={<FeatherBuilding />}
              label="Organization Settings"
              onClick={() => router.push("/settings/organization")}
            />
            <SettingsMenu.Item
              selected={true}
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
            <span className="w-full text-body-bold font-body-bold text-default-font">Access</span>
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

        <main className="container max-w-none flex grow flex-col items-center gap-12 self-stretch bg-default-background py-12 px-6 md:px-12 shadow-sm">
          <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
            <h2 className="text-heading-2 font-heading-2 text-default-font">Brand Settings</h2>
            <p className="text-body font-body text-subtext-color">
              Customize your brand identity and visual elements
            </p>

            <section className="flex flex-col gap-4">
              <h3 className="text-body-bold font-body-bold text-default-font">Brand Preview</h3>
              <div className="flex w-full items-center justify-center gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-6 py-12">
                <img
                  className="h-12 w-12 flex-none rounded-md object-cover"
                  alt="Brand Preview"
                  src="https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">Your Brand</span>
                  <span className="text-body font-body text-subtext-color">Preview how your brand appears</span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-body-bold font-body-bold text-default-font">Logo Variants</h3>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border px-6 py-6">
                  <FeatherImage className="text-heading-1 font-heading-1 text-neutral-400" />
                  <p className="text-body font-body text-default-font text-center">
                    Upload light logo variant
                  </p>
                  <p className="text-caption font-caption text-subtext-color text-center">
                    SVG, PNG or JPG (max. 800x400px)
                  </p>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border bg-neutral-900 px-6 py-6">
                  <FeatherImage className="text-heading-1 font-heading-1 text-neutral-400" />
                  <p className="text-body font-body text-white text-center">
                    Upload dark logo variant
                  </p>
                  <p className="text-caption font-caption text-neutral-400 text-center">
                    SVG, PNG or JPG (max. 800x400px)
                  </p>
                </div>
              </div>
            </section>

            <TextField label="Brand Name" helpText="The name that appears alongside your logo">
              <TextField.Input placeholder="Enter your brand name" value="" onChange={() => {}} />
            </TextField>

            <div className="flex flex-col items-start gap-1">
              <label className="text-body-bold font-body-bold text-default-font">Primary Font</label>
              <Select
                value=""
                aria-label="Choose your brand's primary typeface"
                onValueChange={(value) => {
                  console.log("Selected font:", value);
                }}
              >
                <option value="figtree">figtree</option>
                <option value="roboto">roboto</option>
              </Select>
            </div>

            <section className="flex flex-col gap-4">
              <h3 className="text-body-bold font-body-bold text-default-font">Brand Colors</h3>
              <div className="flex w-full flex-wrap items-start gap-4">
                <TextField label="Primary" icon={<FeatherDroplet />} helpText="">
                  <TextField.Input placeholder="#000000" value="" onChange={() => {}} />
                </TextField>
                <TextField label="Secondary" icon={<FeatherDroplet />} helpText="">
                  <TextField.Input placeholder="#FFFFFF" value="" onChange={() => {}} />
                </TextField>
              </div>
            </section>

            <TextArea label="Brand Guidelines" helpText="Add notes about your brand usage and guidelines">
              <TextArea.Input
                className="h-auto min-h-[112px] w-full flex-none"
                placeholder="Enter your brand guidelines..."
                value=""
                onChange={() => {}}
              />
            </TextArea>

            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full flex-wrap items-center justify-between">
                <Button variant="secondary" onClick={() => {}}>
                  <FeatherDownload />
                  Download assets
                </Button>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={() => {}}>
                    Reset
                  </Button>
                  <Button onClick={() => {}}>Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DefaultPageLayout>
  );
}
// "use client";

// import React from "react";
// import { DefaultPageLayout } from "@/components/ui/layouts/DefaultPageLayout";
// import SettingsMenu from "@/components/ui/components/SettingsMenu";
// import { 
//   FeatherBuilding, FeatherImage, FeatherFileText, FeatherGlobe, FeatherLock, FeatherUsers,
//   FeatherDroplet, FeatherDownload 
// } from "@subframe/core";
// import TextField from "@/components/ui/components/TextField";
// import Select from "@/components/ui/components/Select";
// import TextArea from "@/components/ui/components/TextArea";
// import { Button } from "@/ui/components/Button";

// function BrandShowcasePage() {
//   return (
//     <DefaultPageLayout>
//       <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
//         <SettingsMenu className="mobile:w-full mobile:grow mobile:shrink-0 mobile:basis-0">
//           <span className="w-full text-heading-3 font-heading-3 text-default-font">
//             Settings
//           </span>
//           <div className="flex w-full flex-col items-start gap-2">
//             <span className="w-full text-body-bold font-body-bold text-default-font">
//               Organization
//             </span>
//             <div className="flex w-full flex-col items-start gap-1">
//               <SettingsMenu.Item
//                 icon={<FeatherBuilding />}
//                 label="Organization Settings"
//               />
//               <SettingsMenu.Item
//                 selected={true}
//                 icon={<FeatherImage />}
//                 label="Branding"
//               />
//               <SettingsMenu.Item icon={<FeatherFileText />} label="Templates" />
//             </div>
//           </div>
//           <div className="flex w-full flex-col items-start gap-2">
//             <span className="w-full text-body-bold font-body-bold text-default-font">
//               Access
//             </span>
//             <div className="flex w-full flex-col items-start gap-1">
//               <SettingsMenu.Item icon={<FeatherGlobe />} label="Domain" />
//               <SettingsMenu.Item icon={<FeatherLock />} label="SSO" />
//               <SettingsMenu.Item icon={<FeatherUsers />} label="Team Members" />
//             </div>
//           </div>
//         </SettingsMenu>

//         <div className="container max-w-none flex grow shrink-0 basis-0 flex-col items-center gap-12 self-stretch bg-default-background py-12 shadow-sm">
//           <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
//             <div className="flex w-full flex-col items-start gap-1">
//               <span className="w-full text-heading-2 font-heading-2 text-default-font">
//                 Brand Settings
//               </span>
//               <span className="text-body font-body text-subtext-color">
//                 Customize your brand identity and visual elements
//               </span>
//             </div>

//             <div className="flex w-full flex-col items-start gap-6">
//               <div className="flex w-full flex-col items-start gap-4">
//                 <span className="text-body-bold font-body-bold text-default-font">
//                   Brand Preview
//                 </span>
//                 <div className="flex w-full items-center justify-center gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-6 py-12">
//                   <img
//                     className="h-12 w-12 flex-none rounded-md object-cover"
//                     src="https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
//                     alt="Brand preview"
//                   />
//                   <div className="flex flex-col items-start gap-1">
//                     <span className="text-heading-3 font-heading-3 text-default-font">
//                       Your Brand
//                     </span>
//                     <span className="text-body font-body text-subtext-color">
//                       Preview how your brand appears
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex w-full flex-col items-start gap-4">
//                 <span className="text-body-bold font-body-bold text-default-font">
//                   Logo Variants
//                 </span>
//                 <div className="flex w-full flex-col items-start gap-4">
//                   <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border px-6 py-6">
//                     <FeatherImage className="text-heading-1 font-heading-1 text-neutral-400" />
//                     <div className="flex flex-col items-center justify-center gap-1">
//                       <span className="text-body font-body text-default-font text-center">
//                         Upload light logo variant
//                       </span>
//                       <span className="text-caption font-caption text-subtext-color text-center">
//                         SVG, PNG or JPG (max. 800x400px)
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border bg-neutral-900 px-6 py-6">
//                     <FeatherImage className="text-heading-1 font-heading-1 text-neutral-400" />
//                     <div className="flex flex-col items-center justify-center gap-1">
//                       <span className="text-body font-body text-white text-center">
//                         Upload dark logo variant
//                       </span>
//                       <span className="text-caption font-caption text-neutral-400 text-center">
//                         SVG, PNG or JPG (max. 800x400px)
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <TextField label="Brand Name" helpText="The name that appears alongside your logo">
//                 <TextField.Input
//                   placeholder="Enter your brand name"
//                   value=""
//                   onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
//                 />
//               </TextField>

//               <div className="flex flex-col items-start gap-1">
//                 <label className="text-body-bold font-body-bold text-default-font">
//                   Primary Font
//                 </label>
//                 <Select
//                   label="Primary Font"
//                   aria-label="Choose your brand's primary typeface"
//                   value="figtree"
//                   onValueChange={(value: string) => {
//                     console.log("Selected font:", value);
//                   }}
//                 >
//                   <option value="figtree">figtree</option>
//                   <option value="roboto">roboto</option>
//                 </Select>
//               </div>
//             </div>

//             <div className="flex w-full flex-col items-start gap-4">
//               <span className="text-body-bold font-body-bold text-default-font">
//                 Brand Colors
//               </span>
//               <div className="flex w-full flex-wrap items-start gap-4">
//                 <TextField label="Primary" icon={<FeatherDroplet />} helpText="">
//                   <TextField.Input
//                     placeholder="#000000"
//                     value=""
//                     onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
//                   />
//                 </TextField>

//                 <TextField label="Secondary" icon={<FeatherDroplet />} helpText="">
//                   <TextField.Input
//                     placeholder="#FFFFFF"
//                     value=""
//                     onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
//                   />
//                 </TextField>
//               </div>
//             </div>

//             <TextArea label="Brand Guidelines" helpText="Add notes about your brand usage and guidelines">
//               <TextArea.Input
//                 className="h-auto min-h-[112px] w-full flex-none"
//                 placeholder="Enter your brand guidelines..."
//                 value=""
//                 onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {}}
//               />
//             </TextArea>
//           </div>

//           <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

//           <div className="flex w-full flex-col items-start gap-2">
//             <div className="flex w-full flex-wrap items-center justify-between">
//               <Button variant="neutral-tertiary" icon={<FeatherDownload />} onClick={() => {}}>
//                 Download assets
//               </Button>
//               <div className="flex items-center justify-end gap-2">
//                 <Button variant="neutral-tertiary" onClick={() => {}}>
//                   Reset
//                 </Button>
//                 <Button onClick={() => {}}>Save Changes</Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DefaultPageLayout>
//   );
// }

// export default BrandShowcasePage;

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
// // import { TextField } from "@/components/ui/components/TextField";

// // import { Select } from "@/ui/components/Select";
// // import { FeatherDroplet } from "@subframe/core";
// // import { TextArea } from "@/components/ui/components/TextArea";
// // import { Button } from "@/ui/components/Button";
// // import { FeatherDownload } from "@subframe/core";

// // function BrandShowcasePage() {
// //   return (
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
// //                 icon={<FeatherBuilding />}
// //                 label="Organization Settings"
// //               />
// //               <SettingsMenu.Item
// //                 selected={true}
// //                 icon={<FeatherImage />}
// //                 label="Branding"
// //               />
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
// //                 Brand Settings
// //               </span>
// //               <span className="text-body font-body text-subtext-color">
// //                 Customize your brand identity and visual elements
// //               </span>
// //             </div>
// //             <div className="flex w-full flex-col items-start gap-6">
// //               <div className="flex w-full flex-col items-start gap-4">
// //               <span className="text-body-bold font-body-bold text-default-font">
// //                 Brand Preview
// //               </span>
// //               <div className="flex w-full items-center justify-center gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-6 py-12">
// //                 <img
// //                 className="h-12 w-12 flex-none rounded-md object-cover"
// //                 src="https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
// //                 />
// //                 <div className="flex flex-col items-start gap-1">
// //                 <span className="text-heading-3 font-heading-3 text-default-font">
// //                   Your Brand
// //                 </span>
// //                 <span className="text-body font-body text-subtext-color">
// //                   Preview how your brand appears
// //                 </span>
// //                 </div>
// //               </div>
// //               </div>
// //               <div className="flex w-full flex-col items-start gap-4">
// //               <span className="text-body-bold font-body-bold text-default-font">
// //                 Logo Variants
// //               </span>
// //               <div className="flex w-full flex-col items-start gap-4">
// //                 <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border px-6 py-6">
// //                 <FeatherImage className="text-heading-1 font-heading-1 text-neutral-400" />
// //                 <div className="flex flex-col items-center justify-center gap-1">
// //                   <span className="text-body font-body text-default-font text-center">
// //                   Upload light logo variant
// //                   </span>
// //                   <span className="text-caption font-caption text-subtext-color text-center">
// //                   SVG, PNG or JPG (max. 800x400px)
// //                   </span>
// //                 </div>
// //                 </div>
// //                 <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border bg-neutral-900 px-6 py-6">
// //                 <FeatherImage className="text-heading-1 font-heading-1 text-neutral-400" />
// //                 <div className="flex flex-col items-center justify-center gap-1">
// //                   <span className="text-body font-body text-white text-center">
// //                   Upload dark logo variant
// //                   </span>
// //                   <span className="text-caption font-caption text-neutral-400 text-center">
// //                   SVG, PNG or JPG (max. 800x400px)
// //                   </span>
// //                 </div>
// //                 </div>
// //               </div>
// //               </div>
// //               <TextField
// //               label="Brand Name"
// //               helpText="The name that appears alongside your logo"
// //               >
// //               <TextField.Input
// //                 placeholder="Enter your brand name"
// //                 value=""
// //                 onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
// //               />
// //               </TextField>
// //               <div className="flex flex-col items-start gap-1">
// //               <label className="text-body-bold font-body-bold text-default-font">
// //                 Primary Font
// //               </label>
// //               <Select
// //                 defaultValue=""
// //                 aria-label="Choose your brand's primary typeface"
// //                 value={undefined}
// //                 onValueChange={(value: string) => {}}
// //               >
// //                 <option value="figtree">figtree</option>
// //                 <option value="roboto">roboto</option>
// //               </Select>
// //               </div>
// //             </div>
// //               <div className="flex w-full flex-col items-start gap-4">
// //                 <span className="text-body-bold font-body-bold text-default-font">
// //                   Brand Colors
// //                 </span>
// //                 <div className="flex w-full flex-wrap items-start gap-4">
// //                   <TextField
// //                     label="Primary"
// //                     helpText=""
// //                     icon={<FeatherDroplet />}
// //                   >
// //                     <TextField.Input
// //                       placeholder="#000000"
// //                       value=""
// //                       onChange={(
// //                         event: React.ChangeEvent<HTMLInputElement>
// //                       ) => {}}
// //                     />
// //                   </TextField>
// //                   <TextField
// //                     label="Secondary"
// //                     helpText=""
// //                     icon={<FeatherDroplet />}
// //                   >
// //                     <TextField.Input
// //                       placeholder="#FFFFFF"
// //                       value=""
// //                       onChange={(
// //                         event: React.ChangeEvent<HTMLInputElement>
// //                       ) => {}}
// //                     />
// //                   </TextField>
// //                 </div>
// //               </div>
// //               <TextArea
// //                 label="Brand Guidelines"
// //                 helpText="Add notes about your brand usage and guidelines"
// //               >
// //                 <TextArea.Input
// //                   className="h-auto min-h-[112px] w-full flex-none"
// //                   placeholder="Enter your brand guidelines..."
// //                   value=""
// //                   onChange={(
// //                     event: React.ChangeEvent<HTMLTextAreaElement>
// //                   ) => {}}
// //                 />
// //               </TextArea>
// //             </div>
// //             <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
// //             <div className="flex w-full flex-col items-start gap-2">
// //               <div className="flex w-full flex-wrap items-center justify-between">
// //                 <Button
// //                   variant="neutral-tertiary"
// //                   icon={<FeatherDownload />}
// //                   onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
// //                 >
// //                   Download assets
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
// //   </DefaultPageLayout>
// //   );
// // }

// // export default BrandShowcasePage;