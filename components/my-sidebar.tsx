"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
	User,
	Settings,
	Bell,
	Trophy,
	Send,
	LogOut,
	Sun,
	Moon,
	Menu,
	X,
	Home,
	CreditCard,
	UserPlus,
	Users,
	FileText,
	Shield,
	Info,
	Mail,
	LogIn,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function MySidebar() {
	const { data: session } = useSession();

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();

	type SidebarItem = {
		icon: React.ElementType;
		label: string;
		href: string;
		active: boolean;
		badge?: string;
	};

	const sidebarItems: SidebarItem[] = [{ icon: Home, label: "Feed", href: "/", active: pathname === "/" }];

	if (session) {
		sidebarItems.push(
			{
				icon: User,
				label: "Meu Perfil",
				href: `/${session?.user?.nickname}`,
				active: pathname === `/${session?.user?.nickname}`,
			},
			{ icon: Settings, label: "Minha Conta", href: "/minha-conta", active: pathname === "/minha-conta" },
			{
				icon: Bell,
				label: "Perguntas Recebidas",
				href: "/perguntas-recebidas",
				active: pathname === "/perguntas-recebidas",
				badge: (
					session?.user?.questions_received?.reduce((acc, question) => {
						return question.question_is_awaiting_answer ? acc + 1 : acc;
					}, 0) ?? 0
				).toString(),
			},
			{ icon: Trophy, label: "TOP 10 Curtidas", href: "/top-curtidas", active: pathname === "/top-curtidas" },
			{
				icon: Send,
				label: "Perguntas Enviadas",
				href: "/perguntas-enviadas",
				active: pathname === "/perguntas-enviadas",
			},
			{
				icon: CreditCard,
				label: "Pagamentos",
				href: "/pagamentos",
				active: pathname === "/pagamentos",
			},
			{
				icon: UserPlus,
				label: "Seguidores",
				href: "/seguidores",
				active: pathname === "/seguidores",
			},
			{
				icon: Users,
				label: "Seguindo",
				href: "/seguindo",
				active: pathname === "/seguindo",
			},
		);
	}

	const legalItems = [
		{ icon: Info, label: "Sobre", href: "/sobre", active: pathname === "/sobre" },
		{ icon: Mail, label: "Contato", href: "/contato", active: pathname === "/contato" },
		{
			icon: Shield,
			label: "Política de Privacidade",
			href: "/politica-de-privacidade",
			active: pathname === "/politica-de-privacidade",
		},
		{ icon: FileText, label: "Termos de Uso", href: "/termos-de-uso", active: pathname === "/termos-de-uso" },
	];

	return (
		<>
			<header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex h-full items-center justify-between px-4">
					<Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
						<Menu className="h-5 w-5" />
					</Button>

					<div className="flex items-center space-x-2">
						<Image
							src="https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"
							alt="RespondeAê"
							width={32}
							height={32}
							className="rounded-lg"
						/>
						<span className="text-xl font-bold">RespondeAê</span>
					</div>

					<Button variant="ghost" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
						{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
					</Button>
				</div>
			</header>

			<aside
				className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-80 lg:border-r lg:bg-background lg:z-40"
				style={{ left: "calc(50% - 600px)" }}
			>
				<div className="flex flex-col h-full">
					<div className="flex items-center h-16 px-6 border-b flex-shrink-0">
						<div className="flex items-center space-x-3">
							<Image
								src="https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"
								alt="RespondeAê"
								width={40}
								height={40}
								className="rounded-lg"
							/>
							<span className="text-2xl font-bold">RespondeAê</span>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto">
						<nav className="px-2 py-6 space-y-2">
							{sidebarItems.map((item) => (
								<Link key={item.label} href={item.href}>
									<Button
										variant={item.active ? "secondary" : "ghost"}
										className={`w-full justify-start h-12 ${
											item.active
												? "bg-foreground text-background font-bold hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
												: ""
										}`}
									>
										<item.icon className="mr-3 h-5 w-5" />
										<span className="flex-1 text-left">{item.label}</span>
										{item.badge !== undefined && Number(item.badge) > 0 && (
											<Badge variant="destructive" className="ml-2">
												{item.badge}
											</Badge>
										)}
									</Button>
								</Link>
							))}
						</nav>

						{/* Separator */}
						<hr className="mx-4 border-border" />

						{/* Legal Links */}
						<div className="px-2 py-2 space-y-2">
							{legalItems.map((item) => (
								<Link key={item.label} href={item.href}>
									<Button
										variant={item.active ? "secondary" : "ghost"}
										className={`w-full justify-start h-12 ${
											item.active
												? "bg-foreground text-background font-bold hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
												: ""
										}`}
									>
										<item.icon className="mr-3 h-5 w-5" />
										<span className="flex-1 text-left">{item.label}</span>
									</Button>
								</Link>
							))}
						</div>
					</div>

					<div className="p-4 border-t space-y-2 flex-shrink-0">
						<Button
							variant="ghost"
							className="w-full justify-start h-11"
							onClick={() => setTheme(theme === "light" ? "dark" : "light")}
						>
							{theme === "light" ? <Moon className="mr-3 h-5 w-5" /> : <Sun className="mr-3 h-5 w-5" />}
							<span className="flex-1 text-left">{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>
						</Button>
						{session ? (
							<Button
								onClick={() => signOut({ callbackUrl: "/" })}
								variant="ghost"
								className="w-full justify-start h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
							>
								<LogOut className="mr-3 h-5 w-5" />
								<span className="flex-1 text-left">Sair</span>
							</Button>
						) : (
							<Link href="/entrar">
								<Button
									variant="ghost"
									className="w-full justify-start h-11 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 font-bold"
								>
									<LogIn className="mr-3 h-5 w-5" />
									<span className="flex-1 text-left">Entrar Na Minha Conta</span>
								</Button>
							</Link>
						)}
					</div>
				</div>
			</aside>

			{sidebarOpen && (
				<div className="lg:hidden fixed inset-0 z-50 flex">
					<div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
					<aside className="relative flex w-80 h-full flex-col bg-background border-r">
						<div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
							<div className="flex items-center space-x-3">
								<Image
									src="https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"
									alt="RespondeAê"
									width={32}
									height={32}
									className="rounded-lg"
								/>
							</div>
							<Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
								<X className="h-5 w-5" />
							</Button>
						</div>

						<div className="flex-1 overflow-y-auto">
							<nav className="px-4 py-6 space-y-2">
								{sidebarItems.map((item) => (
									<Link key={item.label} href={item.href}>
										<Button
											variant={item.active ? "secondary" : "ghost"}
											className={`w-full justify-start h-12 ${
												item.active
													? "bg-foreground text-background font-bold hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
													: ""
											}`}
											onClick={() => setSidebarOpen(false)}
										>
											<item.icon className="mr-3 h-5 w-5" />
											<span className="flex-1 text-left">{item.label}</span>
											{item.badge !== undefined && Number(item.badge) > 0 && (
												<Badge variant="destructive" className="ml-2">
													{item.badge}
												</Badge>
											)}
										</Button>
									</Link>
								))}
							</nav>

							<hr className="mx-4 border-border" />

							<div className="px-4 py-4 space-y-2">
								{legalItems.map((item) => (
									<Link key={item.label} href={item.href}>
										<Button
											variant={item.active ? "secondary" : "ghost"}
											className={`w-full justify-start h-12 ${
												item.active
													? "bg-foreground text-background font-bold hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
													: ""
											}`}
											onClick={() => setSidebarOpen(false)}
										>
											<item.icon className="mr-3 h-5 w-5" />
											<span className="flex-1 text-left">{item.label}</span>
										</Button>
									</Link>
								))}
							</div>
						</div>

						<div className="p-4 border-t space-y-2 flex-shrink-0">
							<Button
								variant="ghost"
								className="w-full justify-start h-12"
								onClick={() => {
									setTheme(theme === "light" ? "dark" : "light");
									setSidebarOpen(false);
								}}
							>
								{theme === "light" ? (
									<Moon className="mr-3 h-5 w-5" />
								) : (
									<Sun className="mr-3 h-5 w-5" />
								)}
								<span className="flex-1 text-left">
									{theme === "light" ? "Modo Escuro" : "Modo Claro"}
								</span>
							</Button>

							{session ? (
								<Button
									variant="ghost"
									className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
									onClick={() => {
										setSidebarOpen(false);
										signOut({ callbackUrl: "/" });
									}}
								>
									<LogOut className="mr-3 h-5 w-5" />
									<span className="flex-1 text-left">Sair</span>
								</Button>
							) : (
								<Link href="/entrar">
									<Button
										variant="ghost"
										className="w-full justify-start h-12 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 font-bold"
										onClick={() => setSidebarOpen(false)}
									>
										<LogIn className="mr-3 h-5 w-5" />
										<span className="flex-1 text-left">Entrar Na Minha Conta</span>
									</Button>
								</Link>
							)}
						</div>
					</aside>
				</div>
			)}
		</>
	);
}
