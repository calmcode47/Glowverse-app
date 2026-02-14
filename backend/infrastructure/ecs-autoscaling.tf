# ECS Service Auto-Scaling Configuration

resource "aws_appautoscaling_target" "backend_scaling_target" {
  max_capacity       = 20
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU-based scaling policy
resource "aws_appautoscaling_policy" "backend_cpu_scaling" {
  name               = "backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend_scaling_target.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_scaling_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend_scaling_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    
    target_value       = 70.0
    scale_in_cooldown  = 300  # 5 minutes
    scale_out_cooldown = 60   # 1 minute
  }
}

# Memory-based scaling policy
resource "aws_appautoscaling_policy" "backend_memory_scaling" {
  name               = "backend-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend_scaling_target.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_scaling_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend_scaling_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Request-based scaling (custom metric)
resource "aws_appautoscaling_policy" "backend_request_scaling" {
  name               = "backend-request-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend_scaling_target.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_scaling_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend_scaling_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    customized_metric_specification {
      metric_name = "RequestCountPerTarget"
      namespace   = "AWS/ApplicationELB"
      statistic   = "Sum"
      
      dimensions {
        name  = "TargetGroup"
        value = aws_lb_target_group.backend.arn_suffix
      }
    }
    
    target_value       = 1000  # 1000 requests per target
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Scheduled scaling for known peak times
resource "aws_appautoscaling_scheduled_action" "backend_scale_up_morning" {
  name               = "backend-scale-up-morning"
  service_namespace  = aws_appautoscaling_target.backend_scaling_target.service_namespace
  resource_id        = aws_appautoscaling_target.backend_scaling_target.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_scaling_target.scalable_dimension
  schedule           = "cron(0 8 * * ? *)"  # 8 AM UTC daily
  
  scalable_target_action {
    min_capacity = 5
    max_capacity = 20
  }
}

resource "aws_appautoscaling_scheduled_action" "backend_scale_down_night" {
  name               = "backend-scale-down-night"
  service_namespace  = aws_appautoscaling_target.backend_scaling_target.service_namespace
  resource_id        = aws_appautoscaling_target.backend_scaling_target.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_scaling_target.scalable_dimension
  schedule           = "cron(0 0 * * ? *)"  # Midnight UTC daily
  
  scalable_target_action {
    min_capacity = 2
    max_capacity = 10
  }
}
