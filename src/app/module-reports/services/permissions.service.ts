// permissions.service.ts
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    async requestStoragePermissions(): Promise<boolean> {
        if (Capacitor.getPlatform() !== 'android') {
            return true; // No se necesita en web/iOS
        }

        try {
            // Solicitar permisos de almacenamiento
            const permissions = await Filesystem.requestPermissions();

            console.log('📋 Permisos:', permissions);

            if (permissions.publicStorage === 'granted') {
                console.log(' Permisos de almacenamiento concedidos');
                return true;
            } else {
                alert(' Esta app necesita permisos de almacenamiento para descargar archivos.\n\nPor favor, activa los permisos en Ajustes > Aplicaciones > Tu App > Permisos');
                return false;
            }
        } catch (error) {
            console.error(' Error solicitando permisos:', error);
            return false;
        }
    }

    async checkPermissions(): Promise<boolean> {
        if (Capacitor.getPlatform() !== 'android') {
            return true;
        }

        try {
            const permissions = await Filesystem.checkPermissions();
            return permissions.publicStorage === 'granted';
        } catch {
            return false;
        }
    }
}