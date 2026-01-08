import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { HomeParameterType, NewHomeData } from "@/types";
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
import { Trash2 } from "lucide-react";

const parameterSchema = z.object({
  parameter_type_id: z.string(),
  configured_parameters: z.record(z.any()),
});

const homeSchema = z.object({
  name: z.string().min(2, "Home name must be at least 2 characters."),
  parameters: z.array(parameterSchema),
});

type HomeFormData = z.infer<typeof homeSchema>;

interface CreateHomeDialogProps {
  onHomeCreated: () => void;
  children: React.ReactNode;
}

async function fetchHomeParameterTypes(): Promise<HomeParameterType[]> {
  const { data } = await api.get('/home-parameter-types');
  return data.data.homeParameterTypes;
}

async function createHome(homeData: NewHomeData) {
    const { data } = await api.post(`/homes`, homeData);
    return data;
}

export function CreateHomeDialog({ onHomeCreated, children }: CreateHomeDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: paramTypes = [], isLoading: isLoadingParamTypes } = useQuery({
    queryKey: ['homeParameterTypes'],
    queryFn: fetchHomeParameterTypes,
    enabled: open,
  });

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<HomeFormData>({
    resolver: zodResolver(homeSchema),
    defaultValues: { name: "", parameters: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parameters",
  });

  const { mutate: performCreate, isPending } = useMutation({
    mutationFn: createHome,
    onSuccess: () => {
        toast.success("Home created successfully!");
        onHomeCreated();
        queryClient.invalidateQueries({ queryKey: ['homes'] });
        setOpen(false);
    },
    onError: (error: any) => {
        const errorMsg = error.response?.data?.message || "Failed to create home.";
        toast.error(errorMsg);
    }
  });

  const watchParameters = watch("parameters");

  const onSubmit = (data: HomeFormData) => {
    performCreate(data);
  };

  const handleAddParameter = (typeId: string) => {
    const paramType = paramTypes.find(pt => pt.parameter_type_id === typeId);
    if (!paramType) return;

    const defaultParams = paramType.parameters_definition.reduce((acc, param) => {
      if (param.default_value !== undefined) {
        acc[param.name] = param.default_value;
      }
      return acc;
    }, {} as Record<string, any>);

    append({ parameter_type_id: typeId, configured_parameters: defaultParams });
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
            <DialogTitle>Create New Home</DialogTitle>
            <DialogDescription>Configure the new home and its parameters.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <Label htmlFor="name">Home Name</Label>
              <Input id="name" {...register("name")} className="mt-1" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Home Parameters</Label>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => {
                  const paramType = paramTypes.find(pt => pt.parameter_type_id === watchParameters[index].parameter_type_id);
                  if (!paramType) return null;
                  return (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">{paramType.name}</h4>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {paramType.parameters_definition.map(param => (
                          <div key={param.name}>
                            <Label className="capitalize">{param.name.replace(/_/g, ' ')}</Label>
                            <Controller
                              name={`parameters.${index}.configured_parameters.${param.name}`}
                              control={control}
                              defaultValue={param.default_value}
                              render={({ field: paramField }) => (
                                <Input type="text" {...paramField} className="mt-1" />
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Select onValueChange={handleAddParameter} value="">
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingParamTypes ? "Loading..." : "Add a parameter set..."} />
                </SelectTrigger>
                <SelectContent>
                  {paramTypes
                    .filter(pt => !watchParameters.some(p => p.parameter_type_id === pt.parameter_type_id))
                    .map(pt => (
                      <SelectItem key={pt.parameter_type_id} value={pt.parameter_type_id}>
                        {pt.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Home"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
