"use client";

import { Button } from "@/components/ui/button";
import { FaTiktok, FaTwitch, FaXTwitter } from "react-icons/fa6";
import { Facebook, Instagram, Github, Linkedin } from "lucide-react";
import Link from "next/link";

interface SocialLinksProps {
	profile: any;
}

export function ProfileSocialLinks({ profile }: SocialLinksProps) {
	const socialLinks = [
		{
			icon: Instagram,
			color: "text-pink-500 dark:text-white",
			href: profile?.instagram ?? null,
		},
		{
			icon: Facebook,
			color: "text-blue-600 dark:text-white",
			href: profile?.facebook ?? null,
		},
		{
			icon: FaXTwitter,
			color: "text-blue-400 dark:text-white",
			href: profile?.twitter ?? null,
		},
		{
			icon: Linkedin,
			color: "text-blue-700 dark:text-white",
			href: profile?.linkedin ?? null,
		},
		{
			icon: Github,
			color: "text-gray-800 dark:text-white",
			href: profile?.github ?? null,
		},
		{
			icon: FaTiktok,
			color: "text-green-500 dark:text-white",
			href: profile?.tiktok ?? null,
		},
		{
			icon: FaTwitch,
			color: "text-purple-500 dark:text-white",
			href: profile?.twitch ?? null,
		},
	];

	return (
		<div className="flex flex-wrap justify-center gap-3 mb-4">
			{socialLinks.map(
				(social, index) =>
					social.href && (
						<Link key={index} href={social.href} target="_blank" rel="noopener noreferrer">
							<Button variant="ghost" size="icon" className={`text-xl ${social.color}`}>
								<social.icon className="h-5 w-5" />
							</Button>
						</Link>
					),
			)}
		</div>
	);
}
