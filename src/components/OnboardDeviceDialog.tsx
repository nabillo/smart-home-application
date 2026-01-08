import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { Room, FunctionalityType, NewDeviceData } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { PlusCircle, Trash2 } from "lucide-react";

const functionalitySchema = z.object({
  functionality_type_id: z.string(),
  configured_parameters: z.record(z.any()),
});

const deviceSchema = z.object({
  name: z.string().min(3, "Device name is required"),
  room_id: z.string().nullable(),
  functionalities: z.array(functionalitySchema).min(1, "At least one functionality is required"),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface OnboardDeviceDialogProps {
  homeId: string;
  rooms: Room[];
  onDeviceOnboarded: () => void;
  children: React.ReactNode;
}

async function fetchFunctionalityTypes(): Promise<FunctionalityType[]> {
  const { data } = await api.get('/functionality-types');
  return data.data.functionalityTypes;
}

async function onboardDevice({ homeId, deviceData }: { homeId: string; deviceData: NewDeviceData }) {
    const { data } = await api.post(`/homes/${homeId}/devices`, deviceData);
    return data;
}

export function OnboardDeviceDialog({ homeId, rooms, onDeviceOnboarded, children }: OnboardDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: funcTypes = [], isLoading: isLoadingFuncTypes } = useQuery({
    queryKey: ['functionalityTypes'],
    queryFn: fetchFunctionalityTypes,
    enabled: open,
  });

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: { name: "", room_id: null, functionalities: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "functionalities",
  });

  const { mutate: performOnboard, isPending } = useMutation({
    mutationFn: onboardDevice,
    onSuccess: () => {
        toast.success("Device onboarded successfully!");
        onDeviceOnboarded();
        queryClient.invalidateQueries({ queryKey: ['devices', homeId] });
        setOpen(false);
    },
    onError: (error: any) => {
        const errorMsg = error.response?.data?.message || "Failed to onboard device.";
        toast.error(errorMsg);
    }
  });

  const watchFunctionalities = watch("functionalities");

  const onSubmit = (data: DeviceFormData) => {
    const payload: NewDeviceData = {
      ...data,
    };
    performOnboard({ homeId, deviceData: payload });
  };

  const handleAddFunctionality = (typeId: string) => {
    const funcType = funcTypes.find(ft => ft.functionality_type_id === typeId);
    if (!funcType) return;

    const defaultParams = funcType.parameters_definition.reduce((acc, param) => {
      if (param.default_value !== undefined) {
        acc[param.name] = param.default_value;
      }
      return acc;
    }, {} as Record<string, any>);

    append({ functionality_type_id: typeId, configured_parameters: defaultParams });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        reset();
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Onboard New Device</DialogTitle>
            <DialogDescription>Configure the new device for your home.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Device Name</Label>
                <Input id="name" {...register("name")} className="mt-1" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="room_id">Location</Label>
                <Controller
                  name="room_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(value === 'home' ? null : value)} defaultValue={field.value || 'home'}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Assign to Home</SelectItem>
                        {rooms.map(room => (
                          <SelectItem key={room.room_id} value={room.room_id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Functionalities */}
            <div>
              <Label>Functionalities</Label>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => {
                  const funcType = funcTypes.find(ft => ft.functionality_type_id === watchFunctionalities[index].functionality_type_id);
                  if (!funcType) return null;
                  return (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">{funcType.name}</h4>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {funcType.parameters_definition.map(param => (
                          <div key={param.name}>
                            <Label className="capitalize">{param.name.replace(/_/g, ' ')}</Label>
                            <Controller
                              name={`functionalities.${index}.configured_parameters.${param.name}`}
                              control={control}
                              defaultValue={param.default_value}
                              render={({ field: paramField }) => {
                                switch (param.data_type) {
                                  case 'boolean':
                                    return <Switch checked={paramField.value} onCheckedChange={paramField.onChange} className="mt-1" />;
                                  case 'integer':
                                  case 'float':
                                    return <Input type="number" {...paramField} onChange={e => paramField.onChange(param.data_type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))} className="mt-1" />;
                                  case 'list':
                                    return (
                                      <Select onValueChange={paramField.onChange} defaultValue={paramField.value}>
                                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {param.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    );
                                  default:
                                    return <Input type="text" {...paramField} className="mt-1" />;
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.functionalities && <p className="text-red-500 text-xs mt-1">{errors.functionalities.message || errors.functionalities.root?.message}</p>}
            </div>

            {/* Add Functionality Dropdown */}
            <div>
              <Select onValueChange={handleAddFunctionality}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingFuncTypes ? "Loading..." : "Add a functionality..."} />
                </SelectTrigger>
                <SelectContent>
                  {funcTypes.map(ft => (
                    <SelectItem key={ft.functionality_type_id} value={ft.functionality_type_id}>
                      {ft.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Onboarding..." : "Onboard Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
