import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Home, Room as RoomType, Device } from '@/types';
import api from '@/api/api';
import { PlusCircle, DoorOpen, Home as HomeIcon, MoreHorizontal, Pencil, Trash2, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateRoomDialog } from '@/components/CreateRoomDialog';
import { OnboardDeviceDialog } from '@/components/OnboardDeviceDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { EditRoomDialog } from '@/components/EditRoomDialog';
import { EditDeviceDialog } from '@/components/EditDeviceDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';

async function fetchHome(homeId: string): Promise<Home> {
  const { data } = await api.get(`/homes/${homeId}`);
  return data.data.home;
}

async function fetchRooms(homeId: string): Promise<RoomType[]> {
  const { data } = await api.get(`/homes/${homeId}/rooms`);
  return data.data.rooms;
}

async function fetchDevices(homeId: string): Promise<Device[]> {
  const { data } = await api.get(`/homes/${homeId}/devices`);
  return data.data.devices;
}

async function deleteRoom({ homeId, roomId }: { homeId: string; roomId: string }) {
  await api.delete(`/homes/${homeId}/rooms/${roomId}`);
}

async function deleteDevice({ homeId, deviceId }: { homeId: string; deviceId: string }) {
  await api.delete(`/homes/${homeId}/devices/${deviceId}`);
}

const DeviceCard = ({ device, rooms }: { device: Device; rooms: RoomType[] }) => (
  <div className="p-4 border rounded-lg bg-card flex justify-between items-center">
    <div className="flex items-center gap-3">
      <Cpu className="h-5 w-5 text-muted-foreground" />
      <h3 className="font-medium">{device.name}</h3>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditDeviceDialog device={device} rooms={rooms} onSuccess={() => {}}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        </EditDeviceDialog>
        {/* The delete action will be added here */}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const HomePage = () => {
  const { homeId } = useParams<{ homeId: string }>();
  const queryClient = useQueryClient();

  const [roomToDelete, setRoomToDelete] = useState<RoomType | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  if (!homeId) return <div>Invalid Home ID</div>;

  const { data: home, isLoading: isLoadingHome, isError: isErrorHome } = useQuery({
    queryKey: ['home', homeId],
    queryFn: () => fetchHome(homeId),
  });

  const { data: rooms = [], refetch: refetchRooms } = useQuery({
    queryKey: ['rooms', homeId],
    queryFn: () => fetchRooms(homeId),
  });

  const { data: devices = [], refetch: refetchDevices } = useQuery({
    queryKey: ['devices', homeId],
    queryFn: () => fetchDevices(homeId),
  });

  const { mutate: performDeleteRoom, isPending: isDeletingRoom } = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      toast.success('Room deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['rooms', homeId] });
      setRoomToDelete(null);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to delete room.';
      toast.error(errorMsg);
    },
  });

  const { mutate: performDeleteDevice, isPending: isDeletingDevice } = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      toast.success('Device deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['devices', homeId] });
      setDeviceToDelete(null);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to delete device.';
      toast.error(errorMsg);
    },
  });

  const devicesInHome = devices.filter(d => !d.room_id);

  if (isLoadingHome) return <div className="p-10">Loading home dashboard...</div>;
  if (isErrorHome) return <div className="p-10 text-destructive">Error loading home data.</div>;

  const renderDeviceCard = (device: Device) => (
    <div key={device.device_id} className="p-4 border rounded-lg bg-card flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Cpu className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">{device.name}</h3>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <EditDeviceDialog device={device} rooms={rooms} onSuccess={() => {}}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          </EditDeviceDialog>
          <DropdownMenuItem onClick={() => setDeviceToDelete(device)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{home?.name}</h1>
          <p className="mt-1 text-muted-foreground">Manage your rooms and devices.</p>
        </div>
        <div className="flex gap-2">
          <CreateRoomDialog homeId={homeId} onRoomCreated={refetchRooms}>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </CreateRoomDialog>
          <OnboardDeviceDialog homeId={homeId} rooms={rooms} onDeviceOnboarded={refetchDevices}>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Onboard Device
             </Button>
          </OnboardDeviceDialog>
        </div>
      </div>

      <div className="space-y-10">
        {rooms.map(room => (
          <div key={room.room_id}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-primary" />
                {room.name}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditRoomDialog room={room} onSuccess={() => {}}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  </EditRoomDialog>
                  <DropdownMenuItem onClick={() => setRoomToDelete(room)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {devices.filter(d => d.room_id === room.room_id).map(renderDeviceCard)}
               {devices.filter(d => d.room_id === room.room_id).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">No devices in this room yet.</p>
              )}
            </div>
          </div>
        ))}

        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <HomeIcon className="h-5 w-5 text-primary" />
            Home Devices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {devicesInHome.map(renderDeviceCard)}
            {devicesInHome.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">No devices assigned directly to the home.</p>
            )}
          </div>
        </div>
      </div>
      
      {roomToDelete && (
        <DeleteConfirmationDialog
          open={!!roomToDelete}
          onOpenChange={(isOpen) => !isOpen && setRoomToDelete(null)}
          onConfirm={() => performDeleteRoom({homeId : homeId, roomId : roomToDelete.room_id})}
          title={`Delete Room: ${roomToDelete.name}?`}
          description="This action cannot be undone. This will permanently delete the room."
          isLoading={isDeletingRoom}
        />
      )}

      {deviceToDelete && (
        <DeleteConfirmationDialog
          open={!!deviceToDelete}
          onOpenChange={(isOpen) => !isOpen && setDeviceToDelete(null)}
          onConfirm={() => performDeleteDevice({homeId : homeId, deviceId : deviceToDelete.device_id})}
          title={`Delete Device: ${deviceToDelete.name}?`}
          description="This action cannot be undone. This will permanently delete the device and all its data."
          isLoading={isDeletingDevice}
        />
      )}
    </div>
  );
};

export default HomePage;
