import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';

@Injectable({
    providedIn: 'root'
})
export class FileDownloadService {

    constructor(private http: HttpClient) { }

    /**
     * ✅ DESCARGA DIRECTA - Sin Share API
     */
    async download(fileUrl: string, fileName: string): Promise<boolean> {
        try {
            console.log('🚀 Iniciando descarga:', fileName);

            const platform = Capacitor.getPlatform();
            console.log('📱 Plataforma:', platform);

            if (platform === 'android') {
                return await this.downloadAndroidDirect(fileUrl, fileName);
            } else if (platform === 'web') {
                return await this.downloadBrowser(fileUrl, fileName);
            } else {
                // iOS
                return await this.downloadIOS(fileUrl, fileName);
            }
        } catch (error) {
            console.error('❌ Error crítico:', error);
            alert(`Error al descargar: ${error}`);
            return false;
        }
    }

    /**
     * ✅ ANDROID - Descarga DIRECTA en carpeta visible
     */
    private async downloadAndroidDirect(fileUrl: string, fileName: string): Promise<boolean> {
        try {
            console.log('📥 Descargando archivo...');

            // 1. Descargar archivo
            const fileBlob = await this.http.get(fileUrl, { responseType: 'blob' }).toPromise();

            if (!fileBlob) {
                throw new Error('No se pudo descargar el archivo');
            }

            // 2. Convertir a base64
            const base64Data = await this.blobToBase64(fileBlob);

            // 3. Intentar guardar en External Storage (carpeta Download visible)
            try {
                const result = await Filesystem.writeFile({
                    path: `Download/${fileName}`,
                    data: base64Data,
                    directory: Directory.ExternalStorage,
                    recursive: true
                });

                console.log(' Archivo guardado en Download:', result.uri);

                alert(` Descargado exitosamente!\n\n📂 ${fileName}\n📍 Carpeta: Download\n\nAbre tu gestor de archivos para verlo.`);

                return true;

            } catch (externalError) {
                console.warn(' No se pudo usar ExternalStorage, intentando Documents...');

                // Fallback: Guardar en Documents (carpeta interna pero accesible)
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: false
                });

                console.log(' Archivo guardado en Documents:', result.uri);

                alert(` Archivo guardado!\n\n📂 ${fileName}\n📍 Carpeta interna de la app\n\nPuedes acceder con un explorador de archivos.`);

                return true;
            }

        } catch (error) {
            console.error('❌ Error Android:', error);
            alert(`❌ Error: ${error}`);
            return false;
        }
    }

    /**
     * ✅ iOS - Guardar en Documents
     */
    private async downloadIOS(fileUrl: string, fileName: string): Promise<boolean> {
        try {
            const fileBlob = await this.http.get(fileUrl, { responseType: 'blob' }).toPromise();

            if (!fileBlob) {
                throw new Error('No se pudo descargar el archivo');
            }

            const base64Data = await this.blobToBase64(fileBlob);

            const result = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents
            });

            console.log(' Archivo guardado en iOS:', result.uri);
            alert(` Archivo guardado: ${fileName}`);
            return true;

        } catch (error) {
            console.error('❌ Error iOS:', error);
            alert(`❌ Error: ${error}`);
            return false;
        }
    }

    /**
     * ✅ WEB - Descarga tradicional
     */
    private async downloadBrowser(fileUrl: string, fileName: string): Promise<boolean> {
        return new Promise((resolve) => {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.target = '_blank';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(' Descarga web iniciada');
            resolve(true);
        });
    }

    /**
     * ✅ VERIFICAR SI ARCHIVO EXISTE
     */
    async verifyDownload(fileName: string): Promise<string> {
        try {
            const locations = [
                { dir: Directory.ExternalStorage, path: `Download/${fileName}` },
                { dir: Directory.Documents, path: fileName },
                { dir: Directory.Data, path: fileName }
            ];

            for (const location of locations) {
                try {
                    await Filesystem.readFile({
                        path: location.path,
                        directory: location.dir
                    });
                    return ` Encontrado en ${this.getDirectoryName(location.dir)}: ${location.path}`;
                } catch {
                    console.log(` No encontrado en ${location.dir}`);
                }
            }

            return ' Archivo no encontrado';
        } catch (error) {
            return ` Error: ${error}`;
        }
    }

    /**
     * ✅ LISTAR ARCHIVOS DESCARGADOS
     */
    async listDownloads(): Promise<string[]> {
        try {
            const result = await Filesystem.readdir({
                path: 'Download',
                directory: Directory.ExternalStorage
            });
            return result.files.map(f => f.name);
        } catch (error) {
            console.error('No se pudo listar:', error);
            return [];
        }
    }

    /**
     * UTILIDADES
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    private getDirectoryName(directory: Directory): string {
        switch (directory) {
            case Directory.Documents: return 'Documents';
            case Directory.Data: return 'Data';
            case Directory.Cache: return 'Cache';
            case Directory.ExternalStorage: return 'Download';
            default: return 'Unknown';
        }
    }
}