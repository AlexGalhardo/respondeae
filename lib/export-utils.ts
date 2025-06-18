import * as XLSX from "xlsx";
import TelegramLog from "./telegram-logger";

// Função para exportar dados para Excel
export const exportToExcel = (data: any[], fileName: string) => {
	try {
		// Criar uma nova planilha
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Despesas");

		// Ajustar largura das colunas
		const columnWidths = [
			{ wch: 20 }, // categoria
			{ wch: 30 }, // titulo
			{ wch: 15 }, // valor
			{ wch: 15 }, // data
		];
		worksheet["!cols"] = columnWidths;

		// Gerar o arquivo e fazer download
		XLSX.writeFile(workbook, `${fileName}.xlsx`);
	} catch (error: any) {
		TelegramLog.error(`Error exporting to Excel: ${error?.message}`);
		throw new Error("Não foi possível exportar para Excel");
	}
};

export const exportToCSV = (data: any[], fileName: string) => {
	try {
		const worksheet = XLSX.utils.json_to_sheet(data);
		const csv = XLSX.utils.sheet_to_csv(worksheet);

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", `${fileName}.csv`);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error: any) {
		TelegramLog.error(`Error exporting to CSV: ${error?.message}`);
	}
};
