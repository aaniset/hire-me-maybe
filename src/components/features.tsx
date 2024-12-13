import { BarChart, Cloud, Gift, Mail, Network, Shield } from "lucide-react";
import { AnimatedBeamMultipleOutputDemo } from "@/components/feature-tree";

// const features = [
//   {
//     name: "Build faster.",
//     description:
//       "Get up and running in no time with pre-configured settings and best practices. Say goodbye to setup and focus on what truly matters - building your application.",
//     icon: Network,
//   },
//   {
//     name: "Focus on business logic.",
//     description:
//       "Concentrate on solving business problems instead of dealing with the repetitive setup.",
//     icon: Network,
//   },
//   {
//     name: "Ready for scale.",
//     description:
//       "Prepare for growth from day one. With built-in optimizations and scalable architecture, your application will be ready to handle increased traffic and complexity.",
//     icon: Network,
//   },
// ];
const features = [
  {
    name: "Seamless Gmail Integration",
    description:
      "Automatically track job applications by syncing with your Gmail account. No need for third-party plugins or manual data entry.",
    icon: Mail, // Replace with appropriate icon
  },
  // {
  //   name: "AI-Powered Analysis",
  //   description:
  //     "Our advanced AI reads job-related emails and accurately updates application statuses, saving you time and reducing errors.",
  //   icon: Mail, // Replace with appropriate icon
  // },
  {
    name: "User-Controlled Privacy",
    description:
      "You're in full control of your data. Choose what email information is saved and delete any data at any time, ensuring your privacy.",
    icon: Shield, // Replace with appropriate icon
  },
  {
    name: "Comprehensive Analytics",
    description:
      "Gain valuable insights into your job search with detailed analytics. Optimize your strategy and increase your chances of landing the perfect role.",
    icon: BarChart, // Replace with appropriate icon
  },
  {
    name: "No Installation Required",
    description:
      "Skip the hassle of installing browser extensions or plugins. Our cloud-based solution works directly with your Gmail account.",
    icon: Cloud, // Replace with appropriate icon
  },
  {
    name: "Free Beta Access",
    description:
      "Join our beta program and enjoy all features for free. Be among the first to revolutionize your job search process.",
    icon: Gift, // Replace with appropriate icon
  },
];
export default function Features() {
  return (
    <section className="overflow-hidden mb-12 " id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <p className="mt-2 text-3xl font-bold tracking-tight  dark:text-white text-gray-900 sm:text-4xl">
                Simplify Your Job Search
              </p>
              <p className="mt-6 text-lg leading-8  text-gray-600 dark:text-gray-400">
                Track, analyze, and optimize your job applications effortlessly
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold dark:text-gray-100 text-gray-900">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline dark:text-gray-400">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <AnimatedBeamMultipleOutputDemo className="  self-center" />
        </div>
      </div>
    </section>
  );
}
