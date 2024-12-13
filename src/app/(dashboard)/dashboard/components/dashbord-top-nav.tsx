// "use client";

// // import ModeToggle from '@/components/mode-toggle'
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogClose } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import {
//   SheetContent,
//   Sheet,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// // import { UserProfile } from '@/components/user-profile'
// // import config from '@/config'
// import { HamburgerMenuIcon } from "@radix-ui/react-icons";
// import { Banknote, Folder, Home, Settings } from "lucide-react";
// import Link from "next/link";
// import { ReactNode } from "react";
// import { User } from "next-auth";
// import { signOut } from "next-auth/react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
// } from "@/components/ui/dropdown-menu";
// import { Menu, Package2, Search } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { ModeToggle } from "@/components/mode-toggle";

// export default function DashboardTopNav({ children }: { children: ReactNode }) {
//   return (
//     <div className="flex flex-col">
//       <header className="flex h-14 lg:h-[55px] items-center gap-4 border-b px-3">
//         <Sheet>
//           <SheetTrigger asChild>
//             <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
//               <Menu className="h-5 w-5" />
//               <span className="sr-only">Toggle navigation menu</span>
//             </Button>
//             {/* <div>
//               <HamburgerMenuIcon />
//               <Link href="/dashboard">
//                 <span className="sr-only">Home</span>
//               </Link>
//             </div> */}
//           </SheetTrigger>
//           <SheetContent side="left">
//             <nav className="grid gap-6 text-lg font-medium">
//               <Link
//                 href="#"
//                 className="flex items-center gap-2 text-lg font-semibold"
//               >
//                 <Package2 className="h-6 w-6" />
//                 <span className="sr-only">Acme Inc</span>
//               </Link>
//               <Link
//                 href="#"
//                 className="text-muted-foreground hover:text-foreground"
//               >
//                 Home
//               </Link>
//               <Link
//                 href="#"
//                 className="text-muted-foreground hover:text-foreground"
//               >
//                 Orders
//               </Link>
//               <Link
//                 href="#"
//                 className="text-muted-foreground hover:text-foreground"
//               >
//                 Products
//               </Link>
//               <Link
//                 href="#"
//                 className="text-muted-foreground hover:text-foreground"
//               >
//                 Customers
//               </Link>
//               <Link href="#" className="hover:text-foreground">
//                 Settings
//               </Link>
//             </nav>
//           </SheetContent>
//         </Sheet>
//         <div className="flex justify-center items-center gap-2 ml-auto">
//           {/* {config?.auth?.enabled && <UserProfile />}
//           <ModeToggle /> */}
//           <ModeToggle />
//           <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
//             <form className="ml-auto flex-1 sm:flex-initial">
//               <div className="relative">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   type="search"
//                   placeholder="Search products..."
//                   className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
//                 />
//               </div>
//             </form>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="secondary"
//                   size="icon"
//                   className="rounded-full"
//                 >
//                   {/* <CircleUser className="h-5 w-5" /> */}
//                   <span className="h-5 w-5" />

//                   <span className="sr-only">Toggle user menu</span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuItem>Support</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={(event) => {
//                     // signOut({ callbackUrl: "/login", redirect: true });
//                     event.preventDefault();
//                     signOut({
//                       callbackUrl: `${window.location.origin}/login`,
//                     });
//                     console.log("Signed out");
//                     // router.push("/signup");
//                   }}
//                 >
//                   Logout
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </header>
//       {children}
//     </div>
//   );
// }
